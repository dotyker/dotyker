import { defineStore, acceptHMRUpdate } from 'pinia'

export const useMyStore = defineStore('myStore', {
  state: () => ({
    page: 0,
  }),
  getters: {},
  actions: {},
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMyStore, import.meta.hot))
}
