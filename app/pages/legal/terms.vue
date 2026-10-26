<script setup lang="ts">
// Terms of Service (footer "Terms"). DRAFT text for legal review: config/legal.ts
import { termsOfService } from '~/config/legal'
useHead({ title: 'Terms of Service · Vegaz' })
</script>

<template>
  <LegalDocument :doc="termsOfService" draft />
</template>
