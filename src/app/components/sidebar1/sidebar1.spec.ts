import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sidebar1 } from './sidebar1';

describe('Sidebar1', () => {
  let component: Sidebar1;
  let fixture: ComponentFixture<Sidebar1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sidebar1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
