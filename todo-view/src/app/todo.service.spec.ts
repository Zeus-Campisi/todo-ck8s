import { TestBed } from '@angular/core/testing';

import { TodoService } from './todo.service';
import { HttpClientModule } from '@angular/common/http';

describe('TodoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TodoService],
      imports: [
        HttpClientModule
      ]
    });
  });

  it('should be created', () => {
    expect(TestBed.inject(TodoService)).toBeTruthy();
  });
});
