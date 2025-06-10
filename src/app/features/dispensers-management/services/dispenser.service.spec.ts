import { TestBed } from '@angular/core/testing';

import { DispenserService } from './dispenser.service';

describe('DispenserService', () => {
  let service: DispenserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DispenserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
