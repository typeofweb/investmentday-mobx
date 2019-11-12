import { types, Instance, getSnapshot } from "mobx-state-tree";
import { autorun, configure } from "mobx";
import { TimeTraveller } from "mst-middlewares";

const LS_SNAPSHOT_KEY = "@@maxwellhealth/todos";

configure({
  enforceActions: "always"
});

export const Todo = types
  .model("Todo", {
    id: types.identifier,
    name: types.string,
    done: types.boolean,
    assignedTo: types.maybe(types.reference(types.late(() => User)))
  })
  .actions(self => ({
    setName(name: string) {
      self.name = name;
    },
    toggle() {
      self.done = !self.done;
    },
    assignTo(user?: UserModel) {
      self.assignedTo = user;
    }
  }));
export type TodoModel = Instance<typeof Todo>;

export const User = types.model("User", {
  id: types.identifier,
  name: types.string
});
export type UserModel = Instance<typeof User>;

const RootStore = types
  .model("RootStore", {
    users: types.array(User),
    todos: types.array(Todo),
  })
  .actions(self => ({
    addTodo(id: string, name: string) {
      self.todos.push(Todo.create({ id, name, done: false }));
    },
    removeTodo(id: string) {
      self.todos.replace(self.todos.filter(t => t.id !== id));
    }
  }))
  .views(self => ({
    get count() {
      return self.todos.length;
    },
    get completedCount() {
      return self.todos.filter(t => t.done).length;
    }
  }));
export type RootStoreModel = Instance<typeof RootStore>;

function getInitialStoreData() {
  try {
    const json = localStorage.getItem(LS_SNAPSHOT_KEY) ?? "";
    const snapshot = JSON.parse(json);
    return snapshot;
  } catch (err) {}

  return {
    todos: [],
    users: [
      { id: "1", name: "Michał" },
      { id: "2", name: "Krzysztof" },
      { id: "3", name: "Andrew" },
      { id: "4", name: "Mike" },
      { id: "5", name: "Erik" }
    ]
  };
}

export const store = RootStore.create(getInitialStoreData());
export const timeTraveller = TimeTraveller.create({}, { targetStore: store })
export type TimeTravellerModel = typeof timeTraveller;

autorun(() => {
  const json = JSON.stringify(getSnapshot(store));
  localStorage.setItem(LS_SNAPSHOT_KEY, json);
});
