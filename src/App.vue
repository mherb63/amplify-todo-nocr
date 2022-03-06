<script setup>

import "@aws-amplify/ui-vue/styles.css";
import { Auth } from 'aws-amplify';
import { Authenticator } from "@aws-amplify/ui-vue";
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
import ConfirmDialog from 'primevue/confirmdialog';

Amplify.configure(awsconfig);

</script>

<template>
  <authenticator v-slot="{ user }">
    <div id="app">
      <div class="app-container">
        <p>Hello <b>{{ user.attributes.email }}</b></p>
        <ButtonTag class="p-button-rounded p-button-sm" @click="Auth.signOut()">Sign Out</ButtonTag>
        <h1>Todo App</h1>
        <InputTextTag type="text" v-model="name" placeholder="Todo name" />
        <InputTextTag type="text" v-model="description" placeholder="Todo description" size="50" />
        <ButtonTag class="p-button" v-on:click="createMyTodo">Create Todo</ButtonTag>
        <div class="grid">
          <div class="col-12"></div>
        </div>
        <div class="grid">
          <div class="col-2"></div>
          <div class="col-8">
            <DataTableTag class="p-datatable-striped p-datatable-sm" :resizableColumnTags="true" :value="todos" selectionMode="single" dataKey="id" v-model:selection="selectedTodo"
                          @row-select="onRowSelect" @row-unselect="onRowUnSelect" showGridLines :metaKeySelection="false">
              <template #header>
                <div class="flex justify-content-end">
                  <span v-show="selectedTodo!=null"><ButtonTag @click="deleteMyTodo()" class="p-button-sm p-button-danger" label="Delete" icon="pi pi-trash" /></span>
                  <span v-show="selectedTodo!=null"><ButtonTag class="p-button-sm" label="Edit" icon="pi pi-user-edit" /></span>
                  <span v-show="selectedTodo==null"><ButtonTag class="p-button-sm" label="New" icon="pi pi-database" /></span>
                </div>
              </template>
              <template #loading>
                Loading Todos. Please wait.
              </template>
              <template #empty>
                No Todos found.
              </template>

              <ColumnTag field="name" header="Name" :sortable="true"></ColumnTag>
              <ColumnTag field="description" header="Description" :sortable="true"></ColumnTag>
              <ColumnTag field="createdAt" header="Created On" :sortable="true"></ColumnTag>
            </DataTableTag>
          </div>
          <div class="col-2"></div>
        </div>
        <ToastTag/>
        <ConfirmDialog/>
      </div>
    </div>
  </authenticator>
</template>

<script>
import { API } from 'aws-amplify';
import { createTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import { onCreateTodo, onDeleteTodo, onUpdateTodo } from './graphql/subscriptions';
import { deleteTodo} from "@/graphql/mutations";

import {ToastSeverity} from "primevue/api";

export default {
  name: 'App',

  data() {
    return {
      name: '',
      description: '',
      selectedTodo: null,
      todos: []
    };
  },

  created() {
    this.getTodos();
    this.subscribe();
  },

  methods: {
    onRowSelect() {
      console.log("selected todo: {}", this.selectedTodo);
    },
    onRowUnSelect() {
      console.log("unselected todo: {}", this.selectedTodo);
    },

    async createMyTodo() {
      if (!this.name || !this.description) return;
      let todo = {name: this.name, description: this.description};
      API.graphql({
        query: createTodo,
        variables: {input: todo}
      }).then(response => {
            this.name = '';
            this.description = '';
            console.log("Successfully created todo, response: {}", response);
          }
      ).catch(error => {
        this.$toast.add({severity: ToastSeverity.ERROR, summary: 'Added new todo with id:  '  + todo.id, life: 5000});
        console.log("Error creating todo, error: {}", error);
      })
    },
    async deleteMyTodo() {
      this.$confirm.require({
        message: 'Are you sure you want to delete Todo with name: ' + this.selectedTodo.name + '?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          const deletedTodo = API.graphql({query: deleteTodo, variables: {input: {id: this.selectedTodo.id}}});
          console.log("deletedTodo: {}", deletedTodo);
        },
        reject: () => {
          return;
        }
      });
    },
    async getTodos() {
      const todos = await API.graphql({
        query: listTodos, variables: {_deleted: {ne: true}}
      });
      todos.data.listTodos.items.forEach(todo => {
        todo.createdAt = moment.utc(todo.createdAt).local().format('MM/DD/YYYY h:mm:ss A z');
      });
      this.todos = todos.data.listTodos.items;
    },
    subscribe() {
      API.graphql({query: onCreateTodo})
          .subscribe({
            next: (eventData) => {
              let todo = eventData.value.data.onCreateTodo;
              console.log("onCreateTodo: {}", todo);
              todo.createdAt = moment.utc(todo.createdAt).local().format('MM/DD/YYYY h:mm:ss A z')
              this.todos.push(todo);

              this.$toast.add({severity: ToastSeverity.SUCCESS, summary: 'Added new todo with name:  '  + todo.name, life: 5000});
            }
          });

      API.graphql({query: onDeleteTodo})
          .subscribe({
            next: (eventData) => {
              let todo = eventData.value.data.onDeleteTodo;
              console.log("onDeleteTodo: {}", todo);
              let newArray = this.todos.filter((item) => item.id !== todo.id);
              this.todos = newArray;
              this.selectedTodo = null;

              this.$toast.add({severity: ToastSeverity.SUCCESS, summary: 'Deleted Todo with name:  '  + todo.name, life: 5000});
            }
          });

      API.graphql({query: onUpdateTodo})
          .subscribe({
            next: (eventData) => {
              let todo = eventData.value.data.onUpdateTodo;
              console.log("onUpdateTodo: {}", todo);
              // let newArray = this.todos.filter((item) => item.id !== todo.id);
              // this.todos = newArray;
            }
          });
    }
  }
}
</script>

<style scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
.app-container {
  text-align: center;
}
.grid {
  margin-top:.2em;
}
body #app .p-button {
  margin-left: .5em;
}
form {
  margin-top: 2em;
}
</style>
