import { defineBoot } from '#q-app/wrappers'
import { useDeviceState } from 'src/stores/device-state'
import { Dark } from 'quasar'
import { watch } from 'vue'

export default defineBoot(async ({ router, store }) => {
  const deviceState = useDeviceState(store)

  if (deviceState.dark) Dark.set(true)

  await router.replace(deviceState.index)

  watch(
    () => Dark.isActive,
    (val) => {
      deviceState.dark = val
    },
  )
})
