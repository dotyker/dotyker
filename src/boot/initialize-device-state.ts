import { defineBoot } from '#q-app/wrappers'
import { useDeviceState } from 'src/stores/device-state'
import { Dark } from 'quasar'
import { watch } from 'vue'

export default defineBoot(({ router, store }) => {
  const deviceState = useDeviceState(store)

  if (deviceState.dark) Dark.set(true)

  setTimeout(() => {
    void router.replace(deviceState.index)
  }, 3000)

  watch(
    () => Dark.isActive,
    (val) => {
      deviceState.dark = val
    },
  )
})
