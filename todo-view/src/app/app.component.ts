import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Todo } from './todo';
import { SearchResult, TodoService } from './todo.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [TodoService]
})
export class AppComponent {
  newTodo: Todo = new Todo();
  searchText = '';
  public todos$: Observable<Todo[]>;
  searchResult$: Observable<SearchResult[]> | undefined;

  constructor(private todoService: TodoService) {
    this.todos$ = todoService.getAllTodos();
  }

  addTodo(): void {
    this.todoService.insertTodo(this.newTodo);
    this.newTodo = new Todo();
    // Refresh list
    this.todos$ = this.todoService.getAllTodos();
  }

  searchTodos(): void {
    this.searchResult$ = this.todoService.searchTodos(this.searchText);
  }
}
