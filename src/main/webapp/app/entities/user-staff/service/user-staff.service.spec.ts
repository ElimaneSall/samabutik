import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { IUserStaff } from '../user-staff.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../user-staff.test-samples';

import { RestUserStaff, UserStaffService } from './user-staff.service';

const requireRestSample: RestUserStaff = {
  ...sampleWithRequiredData,
  lastLoginAt: sampleWithRequiredData.lastLoginAt?.toJSON(),
};

describe('UserStaff Service', () => {
  let service: UserStaffService;
  let httpMock: HttpTestingController;
  let expectedResult: IUserStaff | IUserStaff[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(UserStaffService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a UserStaff', () => {
      const userStaff = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(userStaff).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a UserStaff', () => {
      const userStaff = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(userStaff).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a UserStaff', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of UserStaff', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a UserStaff', () => {
      service.delete(123).subscribe();

      const requests = httpMock.match({ method: 'DELETE' });
      expect(requests.length).toBe(1);
    });

    describe('addUserStaffToCollectionIfMissing', () => {
      it('should add a UserStaff to an empty array', () => {
        const userStaff: IUserStaff = sampleWithRequiredData;
        expectedResult = service.addUserStaffToCollectionIfMissing([], userStaff);
        expect(expectedResult).toEqual([userStaff]);
      });

      it('should not add a UserStaff to an array that contains it', () => {
        const userStaff: IUserStaff = sampleWithRequiredData;
        const userStaffCollection: IUserStaff[] = [
          {
            ...userStaff,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addUserStaffToCollectionIfMissing(userStaffCollection, userStaff);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a UserStaff to an array that doesn't contain it", () => {
        const userStaff: IUserStaff = sampleWithRequiredData;
        const userStaffCollection: IUserStaff[] = [sampleWithPartialData];
        expectedResult = service.addUserStaffToCollectionIfMissing(userStaffCollection, userStaff);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(userStaff);
      });

      it('should add only unique UserStaff to an array', () => {
        const userStaffArray: IUserStaff[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const userStaffCollection: IUserStaff[] = [sampleWithRequiredData];
        expectedResult = service.addUserStaffToCollectionIfMissing(userStaffCollection, ...userStaffArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const userStaff: IUserStaff = sampleWithRequiredData;
        const userStaff2: IUserStaff = sampleWithPartialData;
        expectedResult = service.addUserStaffToCollectionIfMissing([], userStaff, userStaff2);
        expect(expectedResult).toEqual([userStaff, userStaff2]);
      });

      it('should accept null and undefined values', () => {
        const userStaff: IUserStaff = sampleWithRequiredData;
        expectedResult = service.addUserStaffToCollectionIfMissing([], null, userStaff, undefined);
        expect(expectedResult).toEqual([userStaff]);
      });

      it('should return initial array if no UserStaff is added', () => {
        const userStaffCollection: IUserStaff[] = [sampleWithRequiredData];
        expectedResult = service.addUserStaffToCollectionIfMissing(userStaffCollection, undefined, null);
        expect(expectedResult).toEqual(userStaffCollection);
      });
    });

    describe('compareUserStaff', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareUserStaff(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 5345 };
        const entity2 = null;

        const compareResult1 = service.compareUserStaff(entity1, entity2);
        const compareResult2 = service.compareUserStaff(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 5345 };
        const entity2 = { id: 20159 };

        const compareResult1 = service.compareUserStaff(entity1, entity2);
        const compareResult2 = service.compareUserStaff(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 5345 };
        const entity2 = { id: 5345 };

        const compareResult1 = service.compareUserStaff(entity1, entity2);
        const compareResult2 = service.compareUserStaff(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
