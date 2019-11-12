import React, { ChangeEventHandler } from 'react';
import './App.css';
import { observer } from "mobx-react";
import { RootStoreModel, TodoModel, UserModel, TimeTravellerModel } from './models';
import uuid from 'uuid';

const TodoItem = observer(({ todo, store }: { todo: TodoModel, store: RootStoreModel }) => {
  return (
    <li>
      <button onClick={() => store.removeTodo(todo.id)}>X</button>
      <input type="checkbox" checked={todo.done} onChange={() => todo.toggle()} />
      <input value={todo.name} onChange={e => todo.setName(e.currentTarget.value)} />
      <UserPickerView user={todo.assignedTo} store={store} onchange={userId => todo.assignTo(userId)} />
    </li>
  )
});

const TodoCount = observer(({ store }: { store: RootStoreModel }) => {
  return (
    <div>
      Done {store.completedCount} out of {store.count}.
    </div>
  )
})

const UserPickerView = observer(({ user, store, onchange }: { user?: UserModel, store: RootStoreModel, onchange: (user?: UserModel) => any }) => {
  const handleUserChange = React.useCallback<ChangeEventHandler<HTMLSelectElement>>((e) => {
    const maybeId = e.currentTarget.value;
    const user = store.users.find(u => u.id === maybeId);

    onchange(user);
  }, [store, onchange]);

  return (
    <select value={user?.id ?? ''} onChange={handleUserChange}>
      <option>-none-</option>
      {store.users.map((user) => <option value={user.id} key={user.id}>{user.name}</option>)}
    </select>
  );
});

const UndoRedo = observer(({timeTraveller}: {timeTraveller: TimeTravellerModel}) => {
  return (
    <div>
      <button disabled={!timeTraveller.canUndo} onClick={() => timeTraveller.undo()}>Undo</button>
      <button disabled={!timeTraveller.canRedo} onClick={() => timeTraveller.redo()}>Redo</button>
    </div>
  )
})

const App = observer(({ store, timeTraveller }: { store: RootStoreModel, timeTraveller: TimeTravellerModel }) => {
  return (
    <div>
      <UndoRedo timeTraveller={timeTraveller} />
      <button onClick={() => store.addTodo(uuid.v4(), 'New todo')}>Add Todo</button>
      <ul>
        {store.todos.map(todo => <TodoItem key={todo.id} todo={todo} store={store} />)}
      </ul>
      <TodoCount store={store} />
    </div>
  )
});

export default App;
