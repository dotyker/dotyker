<template>
  <div class="absolute-full column items-center justify-center q-pa-xl bg-white">
    <q-icon name="sym_o_block" size="80px" color="negative" class="q-mb-md" />
    <h4 class="text-h4 q-mb-md text-negative">Website Blocked</h4>
    <p class="text-body1 text-grey-7 text-center q-mb-md">
      <strong>{{ currentUrl }}</strong>
    </p>
    <p class="text-body2 text-grey-7 text-center q-mb-xl">
      This website cannot be displayed in a frame due to security policies.<br />
      The site has set X-Frame-Options or Content-Security-Policy headers<br />
      that prevent iframe embedding.
    </p>

    <div class="row q-gutter-md">
      <q-btn
        color="primary"
        icon="sym_o_open_in_new"
        label="Open in New Tab"
        @click="$emit('openExternal')"
        size="lg"
      />
      <q-btn
        color="secondary"
        icon="sym_o_refresh"
        label="Try Again"
        @click="$emit('retry')"
        size="lg"
        outline
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentUrl: string
}

defineProps<Props>()

defineEmits<{
  retry: []
  openExternal: []
}>()
</script>
