import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sidebar3 } from './sidebar3';

describe('Sidebar3', () => {
  let component: Sidebar3;
  let fixture: ComponentFixture<Sidebar3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar3]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sidebar3);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have three navigation items', () => {
    expect(component.navItems.length).toBe(3);
  });

  it('should have profile, tickets, and subscription routes', () => {
    const routes = component.navItems.map(item => item.route);
    expect(routes).toContain('/profile');
    expect(routes).toContain('/ticket');
    expect(routes).toContain('/subscription');
  });
});
