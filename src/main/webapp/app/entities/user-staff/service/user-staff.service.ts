import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IUserStaff, NewUserStaff } from '../user-staff.model';

export type PartialUpdateUserStaff = Partial<IUserStaff> & Pick<IUserStaff, 'id'>;

type RestOf<T extends IUserStaff | NewUserStaff> = Omit<T, 'lastLoginAt'> & {
  lastLoginAt?: string | null;
};

export type RestUserStaff = RestOf<IUserStaff>;

export type NewRestUserStaff = RestOf<NewUserStaff>;

export type PartialUpdateRestUserStaff = RestOf<PartialUpdateUserStaff>;

@Injectable()
export class UserStaffsService {
  readonly userStaffsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly userStaffsResource = httpResource<RestUserStaff[]>(() => {
    const params = this.userStaffsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of userStaff that have been fetched. It is updated when the userStaffsResource emits a new value.
   * In case of error while fetching the userStaffs, the signal is set to an empty array.
   */
  readonly userStaffs = computed(() =>
    (this.userStaffsResource.hasValue() ? this.userStaffsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/user-staffs');

  protected convertValueFromServer(restUserStaff: RestUserStaff): IUserStaff {
    return {
      ...restUserStaff,
      lastLoginAt: restUserStaff.lastLoginAt ? dayjs(restUserStaff.lastLoginAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class UserStaffService extends UserStaffsService {
  protected readonly http = inject(HttpClient);

  create(userStaff: NewUserStaff): Observable<IUserStaff> {
    const copy = this.convertValueFromClient(userStaff);
    return this.http.post<RestUserStaff>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(userStaff: IUserStaff): Observable<IUserStaff> {
    const copy = this.convertValueFromClient(userStaff);
    return this.http
      .put<RestUserStaff>(`${this.resourceUrl}/${encodeURIComponent(this.getUserStaffIdentifier(userStaff))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(userStaff: PartialUpdateUserStaff): Observable<IUserStaff> {
    const copy = this.convertValueFromClient(userStaff);
    return this.http
      .patch<RestUserStaff>(`${this.resourceUrl}/${encodeURIComponent(this.getUserStaffIdentifier(userStaff))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IUserStaff> {
    return this.http
      .get<RestUserStaff>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IUserStaff[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestUserStaff[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getUserStaffIdentifier(userStaff: Pick<IUserStaff, 'id'>): number {
    return userStaff.id;
  }

  compareUserStaff(o1: Pick<IUserStaff, 'id'> | null, o2: Pick<IUserStaff, 'id'> | null): boolean {
    return o1 && o2 ? this.getUserStaffIdentifier(o1) === this.getUserStaffIdentifier(o2) : o1 === o2;
  }

  addUserStaffToCollectionIfMissing<Type extends Pick<IUserStaff, 'id'>>(
    userStaffCollection: Type[],
    ...userStaffsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const userStaffs: Type[] = userStaffsToCheck.filter(isPresent);
    if (userStaffs.length > 0) {
      const userStaffCollectionIdentifiers = userStaffCollection.map(userStaffItem => this.getUserStaffIdentifier(userStaffItem));
      const userStaffsToAdd = userStaffs.filter(userStaffItem => {
        const userStaffIdentifier = this.getUserStaffIdentifier(userStaffItem);
        if (userStaffCollectionIdentifiers.includes(userStaffIdentifier)) {
          return false;
        }
        userStaffCollectionIdentifiers.push(userStaffIdentifier);
        return true;
      });
      return [...userStaffsToAdd, ...userStaffCollection];
    }
    return userStaffCollection;
  }

  protected convertValueFromClient<T extends IUserStaff | NewUserStaff | PartialUpdateUserStaff>(userStaff: T): RestOf<T> {
    return {
      ...userStaff,
      lastLoginAt: userStaff.lastLoginAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestUserStaff): IUserStaff {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestUserStaff[]): IUserStaff[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
