import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IAppSettings, NewAppSettings } from '../app-settings.model';

export type PartialUpdateAppSettings = Partial<IAppSettings> & Pick<IAppSettings, 'id'>;

@Injectable()
export class AppSettingsesService {
  readonly appSettingsesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly appSettingsesResource = httpResource<IAppSettings[]>(() => {
    const params = this.appSettingsesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of appSettings that have been fetched. It is updated when the appSettingsesResource emits a new value.
   * In case of error while fetching the appSettingses, the signal is set to an empty array.
   */
  readonly appSettingses = computed(() => (this.appSettingsesResource.hasValue() ? this.appSettingsesResource.value() : []));
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/app-settings');
}

@Injectable({ providedIn: 'root' })
export class AppSettingsService extends AppSettingsesService {
  protected readonly http = inject(HttpClient);

  create(appSettings: NewAppSettings): Observable<IAppSettings> {
    return this.http.post<IAppSettings>(this.resourceUrl, appSettings);
  }

  update(appSettings: IAppSettings): Observable<IAppSettings> {
    return this.http.put<IAppSettings>(
      `${this.resourceUrl}/${encodeURIComponent(this.getAppSettingsIdentifier(appSettings))}`,
      appSettings,
    );
  }

  partialUpdate(appSettings: PartialUpdateAppSettings): Observable<IAppSettings> {
    return this.http.patch<IAppSettings>(
      `${this.resourceUrl}/${encodeURIComponent(this.getAppSettingsIdentifier(appSettings))}`,
      appSettings,
    );
  }

  find(id: number): Observable<IAppSettings> {
    return this.http.get<IAppSettings>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  query(req?: any): Observable<HttpResponse<IAppSettings[]>> {
    const options = createRequestOption(req);
    return this.http.get<IAppSettings[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getAppSettingsIdentifier(appSettings: Pick<IAppSettings, 'id'>): number {
    return appSettings.id;
  }

  compareAppSettings(o1: Pick<IAppSettings, 'id'> | null, o2: Pick<IAppSettings, 'id'> | null): boolean {
    return o1 && o2 ? this.getAppSettingsIdentifier(o1) === this.getAppSettingsIdentifier(o2) : o1 === o2;
  }

  addAppSettingsToCollectionIfMissing<Type extends Pick<IAppSettings, 'id'>>(
    appSettingsCollection: Type[],
    ...appSettingsesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const appSettingses: Type[] = appSettingsesToCheck.filter(isPresent);
    if (appSettingses.length > 0) {
      const appSettingsCollectionIdentifiers = appSettingsCollection.map(appSettingsItem => this.getAppSettingsIdentifier(appSettingsItem));
      const appSettingsesToAdd = appSettingses.filter(appSettingsItem => {
        const appSettingsIdentifier = this.getAppSettingsIdentifier(appSettingsItem);
        if (appSettingsCollectionIdentifiers.includes(appSettingsIdentifier)) {
          return false;
        }
        appSettingsCollectionIdentifiers.push(appSettingsIdentifier);
        return true;
      });
      return [...appSettingsesToAdd, ...appSettingsCollection];
    }
    return appSettingsCollection;
  }
}
