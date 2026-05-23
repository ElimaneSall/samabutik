import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { IAppSettings } from '../app-settings.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../app-settings.test-samples';

import { AppSettingsService } from './app-settings.service';

const requireRestSample: IAppSettings = {
  ...sampleWithRequiredData,
};

describe('AppSettings Service', () => {
  let service: AppSettingsService;
  let httpMock: HttpTestingController;
  let expectedResult: IAppSettings | IAppSettings[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(AppSettingsService);
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

    it('should create a AppSettings', () => {
      const appSettings = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(appSettings).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a AppSettings', () => {
      const appSettings = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(appSettings).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a AppSettings', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of AppSettings', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a AppSettings', () => {
      service.delete(123).subscribe();

      const requests = httpMock.match({ method: 'DELETE' });
      expect(requests.length).toBe(1);
    });

    describe('addAppSettingsToCollectionIfMissing', () => {
      it('should add a AppSettings to an empty array', () => {
        const appSettings: IAppSettings = sampleWithRequiredData;
        expectedResult = service.addAppSettingsToCollectionIfMissing([], appSettings);
        expect(expectedResult).toEqual([appSettings]);
      });

      it('should not add a AppSettings to an array that contains it', () => {
        const appSettings: IAppSettings = sampleWithRequiredData;
        const appSettingsCollection: IAppSettings[] = [
          {
            ...appSettings,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addAppSettingsToCollectionIfMissing(appSettingsCollection, appSettings);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a AppSettings to an array that doesn't contain it", () => {
        const appSettings: IAppSettings = sampleWithRequiredData;
        const appSettingsCollection: IAppSettings[] = [sampleWithPartialData];
        expectedResult = service.addAppSettingsToCollectionIfMissing(appSettingsCollection, appSettings);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(appSettings);
      });

      it('should add only unique AppSettings to an array', () => {
        const appSettingsArray: IAppSettings[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const appSettingsCollection: IAppSettings[] = [sampleWithRequiredData];
        expectedResult = service.addAppSettingsToCollectionIfMissing(appSettingsCollection, ...appSettingsArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const appSettings: IAppSettings = sampleWithRequiredData;
        const appSettings2: IAppSettings = sampleWithPartialData;
        expectedResult = service.addAppSettingsToCollectionIfMissing([], appSettings, appSettings2);
        expect(expectedResult).toEqual([appSettings, appSettings2]);
      });

      it('should accept null and undefined values', () => {
        const appSettings: IAppSettings = sampleWithRequiredData;
        expectedResult = service.addAppSettingsToCollectionIfMissing([], null, appSettings, undefined);
        expect(expectedResult).toEqual([appSettings]);
      });

      it('should return initial array if no AppSettings is added', () => {
        const appSettingsCollection: IAppSettings[] = [sampleWithRequiredData];
        expectedResult = service.addAppSettingsToCollectionIfMissing(appSettingsCollection, undefined, null);
        expect(expectedResult).toEqual(appSettingsCollection);
      });
    });

    describe('compareAppSettings', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareAppSettings(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 31409 };
        const entity2 = null;

        const compareResult1 = service.compareAppSettings(entity1, entity2);
        const compareResult2 = service.compareAppSettings(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 31409 };
        const entity2 = { id: 32391 };

        const compareResult1 = service.compareAppSettings(entity1, entity2);
        const compareResult2 = service.compareAppSettings(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 31409 };
        const entity2 = { id: 31409 };

        const compareResult1 = service.compareAppSettings(entity1, entity2);
        const compareResult2 = service.compareAppSettings(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
