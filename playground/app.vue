<script setup lang="ts">
const ready = useState('ready', () => false)
/**
 * most of the time, vue compiler need at least a VNode, use h() from vue to define and render the component
 */
const ComponentDefinedInSetup = h({
  template: "<div class='border'>hello i'm defined in the setup of app.vue</div>"
})

/**
 * block the navigation until api calls finishes
 */
const { data } = await useAsyncData('templates', async () => {
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

/**
 * you can even auto generate a list of component in a composable
 * then provide it to all children using provide()/inject() !
 */
const Interactive = h({
  template: data.value.interactiveComponent.template,
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
      data.value.interactiveComponent.setup
    )(ref, computed, props)
  },
  props: data.value.interactiveComponent.props
})
</script>

<template>
  <!-- Edit this file to play around with Nuxt but never commit changes! -->
  <div>
    <template v-if="ready">
      <ComponentDefinedInSetup />
      <Name template="<div>I'm the Name.ts component</div>" />
      <show-template :template="data.templateString" name="Julien" />
      <Interactive lastname="Huang" firstname="Julien" />
    </template>
  </div>
</template>

<style>
.border {
  border: 1px solid burlywood;
}
</style>
