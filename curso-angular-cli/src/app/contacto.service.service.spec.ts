import { TestBed } from '@angular/core/testing';

import { Contacto.ServiceService } from './contacto.service.service';

describe('Contacto.ServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Contacto.ServiceService = TestBed.get(Contacto.ServiceService);
    expect(service).toBeTruthy();
  });
});
