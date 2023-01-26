<script setup lang="ts">
import { Component } from 'vue'
import Helloworld from '../components/Helloworld.vue'
const ready = useState('ready', () => false)

const count = ref(0)

const compTemplate = computed(() => `
<div class='border'>
    <div>hello i'm defined in the setup of app.vue</div>
    <div>This component's template is in a computed refreshed on count</div>
    count:` + count.value + `.
    I don't recommend you to do this for performance issue, prefer passing props for mutable data.
</div>`
)

/**
 * most of the time, vue compiler need at least a VNode, use h() from vue to define and render the component
 */
const ComponentDefinedInSetup = computed(() => h({
  template: compTemplate.value
}) as Component)

/**
 * block the navigation until api calls finishes
 */
const { data, pending } = await useAsyncData('templates', async () => {
  const [interactiveComponent, templateString] = await Promise.all([
    $fetch('/api/full-component'),
    $fetch('/api/template')
  ])

  ready.value = true

  return {
    interactiveComponent,
    templateString
  }
}, {})

if (!data.value) {
  throw createError(':( something went wrong')
}

/**
 * you can even auto generate a list of component in a composable
 * then provide it to all children using provide()/inject() !
 */
const Interactive = h({
  template: data.value?.interactiveComponent.template,
  setup (props) {
    /**
     * use new Function for closure
     * add needed params, it can be anything
     */
    // eslint-disable-next-line no-new-func
    return new Function(
      'ref',
      'computed',
      'props',
      data.value?.interactiveComponent.setup ?? ''
    )(ref, computed, props)
  },
  props: data.value?.interactiveComponent.props
}) as Component
</script>

<template>
  <!-- Edit this file to play around with Nuxt but never commit changes! -->
  <div v-if="!pending">
    <Helloworld />
    <ComponentDefinedInSetup />
    <button @click="count++">
      {{ count }}
    </button>
    <template v-if="ready">
      <Name template="<div>I'm the Name.ts component</div>" />
      <show-template :template="data?.templateString" name="Julien" />
      <Interactive lastname="Huang" firstname="Julien" />
    </template>
  </div>
</template>

<style>
.border {
  border: 1px solid burlywood;
}
</style>
