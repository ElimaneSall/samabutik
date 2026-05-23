import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { IPackItem } from '../pack-item.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../pack-item.test-samples';

import { PackItemService } from './pack-item.service';

const requireRestSample: IPackItem = {
  ...sampleWithRequiredData,
};

describe('PackItem Service', () => {
  let service: PackItemService;
  let httpMock: HttpTestingController;
  let expectedResult: IPackItem | IPackItem[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PackItemService);
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

    it('should create a PackItem', () => {
      const packItem = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(packItem).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PackItem', () => {
      const packItem = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(packItem).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PackItem', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PackItem', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PackItem', () => {
      service.delete(123).subscribe();

      const requests = httpMock.match({ method: 'DELETE' });
      expect(requests.length).toBe(1);
    });

    describe('addPackItemToCollectionIfMissing', () => {
      it('should add a PackItem to an empty array', () => {
        const packItem: IPackItem = sampleWithRequiredData;
        expectedResult = service.addPackItemToCollectionIfMissing([], packItem);
        expect(expectedResult).toEqual([packItem]);
      });

      it('should not add a PackItem to an array that contains it', () => {
        const packItem: IPackItem = sampleWithRequiredData;
        const packItemCollection: IPackItem[] = [
          {
            ...packItem,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPackItemToCollectionIfMissing(packItemCollection, packItem);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PackItem to an array that doesn't contain it", () => {
        const packItem: IPackItem = sampleWithRequiredData;
        const packItemCollection: IPackItem[] = [sampleWithPartialData];
        expectedResult = service.addPackItemToCollectionIfMissing(packItemCollection, packItem);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(packItem);
      });

      it('should add only unique PackItem to an array', () => {
        const packItemArray: IPackItem[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const packItemCollection: IPackItem[] = [sampleWithRequiredData];
        expectedResult = service.addPackItemToCollectionIfMissing(packItemCollection, ...packItemArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const packItem: IPackItem = sampleWithRequiredData;
        const packItem2: IPackItem = sampleWithPartialData;
        expectedResult = service.addPackItemToCollectionIfMissing([], packItem, packItem2);
        expect(expectedResult).toEqual([packItem, packItem2]);
      });

      it('should accept null and undefined values', () => {
        const packItem: IPackItem = sampleWithRequiredData;
        expectedResult = service.addPackItemToCollectionIfMissing([], null, packItem, undefined);
        expect(expectedResult).toEqual([packItem]);
      });

      it('should return initial array if no PackItem is added', () => {
        const packItemCollection: IPackItem[] = [sampleWithRequiredData];
        expectedResult = service.addPackItemToCollectionIfMissing(packItemCollection, undefined, null);
        expect(expectedResult).toEqual(packItemCollection);
      });
    });

    describe('comparePackItem', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePackItem(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 4307 };
        const entity2 = null;

        const compareResult1 = service.comparePackItem(entity1, entity2);
        const compareResult2 = service.comparePackItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 4307 };
        const entity2 = { id: 2459 };

        const compareResult1 = service.comparePackItem(entity1, entity2);
        const compareResult2 = service.comparePackItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 4307 };
        const entity2 = { id: 4307 };

        const compareResult1 = service.comparePackItem(entity1, entity2);
        const compareResult2 = service.comparePackItem(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
