import { TestBed } from '@angular/core/testing';

import { ContactUs } from './contact-us';

describe('ContactUs', () => {
  let service: ContactUs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactUs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
