import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchsTable } from './matchs-table';

describe('MatchsTable', () => {
  let component: MatchsTable;
  let fixture: ComponentFixture<MatchsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
