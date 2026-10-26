<script setup lang="ts">
// Privacy Policy (footer "Privacy"). DRAFT text for legal review: config/legal.ts
import { privacyPolicy } from '~/config/legal'
useHead({ title: 'Privacy Policy · Vegaz' })
</script>

<template>
  <LegalDocument :doc="privacyPolicy" draft />
</template>
