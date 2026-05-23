import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { IPack } from '../pack.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../pack.test-samples';

import { PackService, RestPack } from './pack.service';

const requireRestSample: RestPack = {
  ...sampleWithRequiredData,
  startDate: sampleWithRequiredData.startDate?.toJSON(),
  endDate: sampleWithRequiredData.endDate?.toJSON(),
};

describe('Pack Service', () => {
  let service: PackService;
  let httpMock: HttpTestingController;
  let expectedResult: IPack | IPack[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PackService);
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

    it('should create a Pack', () => {
      const pack = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(pack).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Pack', () => {
      const pack = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(pack).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Pack', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Pack', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Pack', () => {
      service.delete(123).subscribe();

      const requests = httpMock.match({ method: 'DELETE' });
      expect(requests.length).toBe(1);
    });

    describe('addPackToCollectionIfMissing', () => {
      it('should add a Pack to an empty array', () => {
        const pack: IPack = sampleWithRequiredData;
        expectedResult = service.addPackToCollectionIfMissing([], pack);
        expect(expectedResult).toEqual([pack]);
      });

      it('should not add a Pack to an array that contains it', () => {
        const pack: IPack = sampleWithRequiredData;
        const packCollection: IPack[] = [
          {
            ...pack,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPackToCollectionIfMissing(packCollection, pack);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Pack to an array that doesn't contain it", () => {
        const pack: IPack = sampleWithRequiredData;
        const packCollection: IPack[] = [sampleWithPartialData];
        expectedResult = service.addPackToCollectionIfMissing(packCollection, pack);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(pack);
      });

      it('should add only unique Pack to an array', () => {
        const packArray: IPack[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const packCollection: IPack[] = [sampleWithRequiredData];
        expectedResult = service.addPackToCollectionIfMissing(packCollection, ...packArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const pack: IPack = sampleWithRequiredData;
        const pack2: IPack = sampleWithPartialData;
        expectedResult = service.addPackToCollectionIfMissing([], pack, pack2);
        expect(expectedResult).toEqual([pack, pack2]);
      });

      it('should accept null and undefined values', () => {
        const pack: IPack = sampleWithRequiredData;
        expectedResult = service.addPackToCollectionIfMissing([], null, pack, undefined);
        expect(expectedResult).toEqual([pack]);
      });

      it('should return initial array if no Pack is added', () => {
        const packCollection: IPack[] = [sampleWithRequiredData];
        expectedResult = service.addPackToCollectionIfMissing(packCollection, undefined, null);
        expect(expectedResult).toEqual(packCollection);
      });
    });

    describe('comparePack', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePack(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 22594 };
        const entity2 = null;

        const compareResult1 = service.comparePack(entity1, entity2);
        const compareResult2 = service.comparePack(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 22594 };
        const entity2 = { id: 28997 };

        const compareResult1 = service.comparePack(entity1, entity2);
        const compareResult2 = service.comparePack(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 22594 };
        const entity2 = { id: 22594 };

        const compareResult1 = service.comparePack(entity1, entity2);
        const compareResult2 = service.comparePack(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
