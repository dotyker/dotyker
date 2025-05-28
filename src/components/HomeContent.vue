<template>
  <div class="text-center">
    <q-icon name="sym_o_computer" size="80px" color="primary" class="q-mb-md" />
    <h3 class="text-h3 q-mb-md text-primary">Digital Screen Browser</h3>
    <p class="text-h6 text-grey-7 q-mb-xl">Enter a URL above to browse websites</p>

    <!-- Quick Access Buttons -->
    <div class="row justify-center q-gutter-md q-mb-lg">
      <q-btn
        color="primary"
        icon="sym_o_language"
        label="Example Site"
        @click="$emit('navigate', 'https://example.com')"
        size="lg"
      />
      <q-btn
        color="secondary"
        icon="sym_o_article"
        label="Wikipedia"
        @click="$emit('navigate', 'https://wikipedia.org')"
        size="lg"
      />
      <q-btn
        color="accent"
        icon="sym_o_code"
        label="GitHub"
        @click="$emit('navigate', 'https://github.com')"
        size="lg"
      />
    </div>

    <!-- Info Card -->
    <q-card class="q-mt-xl" style="max-width: 600px; margin: 0 auto">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="sym_o_info" class="q-mr-sm" />
          Important Notes
        </div>
        <div class="text-body2 text-left">
          <p>
            <strong>Some websites may not load</strong> due to security policies (X-Frame-Options).
          </p>
          <p>
            <strong>Navigation history</strong> only tracks URLs you enter directly, not links
            clicked within websites.
          </p>
          <p><strong>For full functionality</strong>, use the "Open in New Tab" button.</p>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  navigate: [url: string]
}>()
</script>
