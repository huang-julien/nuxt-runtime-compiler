<script setup lang="ts">
import { Component } from 'vue'
import Helloworld from '../components/Helloworld.vue'
const count = ref(0)

const compTemplate = computed(() => `
<div class='border'>
    <div>hello i am defined in the setup of app.vue</div>
    <div>This component template is in a computed refreshed on count</div>
    count: <span class="count">${count.value}</span>.
    I dont recommend you to do this for performance issue, prefer passing props for mutable data.
</div>`
)

const ComponentDefinedInSetup = computed(() => h({
  template: compTemplate.value
}) as Component)

const { data, pending } = await useAsyncData('templates', async () => {
  const [interactiveComponent, templateString] = await Promise.all([
    $fetch('/api/full-component'),
    $fetch('/api/template')
  ])

  return {
    interactiveComponent,
    templateString
  }
}, {})

const Interactive = h({
  template: data.value?.interactiveComponent.template,
  setup (props) {
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

const CustomElementComponent = defineComponent({
  template: `    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
      <semantics>
        <mrow>
          <mi>f</mi><mo stretchy="false">
            (
          </mo><mi>x</mi><mo stretchy="false">
            )
          </mo><mo>=</mo><msubsup>
            <mo>∫</mo><mrow>
              <mo>−</mo><mi mathvariant="normal">
                ∞
              </mi>
            </mrow><mi mathvariant="normal">
              ∞
            </mi>
          </msubsup><mover accent="true">
            <mi>f</mi><mo>^</mo>
          </mover><mo stretchy="false">
            (
          </mo><mi>ξ</mi><mo stretchy="false">
            )
          </mo><msup><mi>e</mi><mrow><mn>2</mn><mi>π</mi><mi>i</mi><mi>ξ</mi><mi>x</mi></mrow></msup><mi>d</mi><mi>ξ</mi>
        </mrow><annotation encoding="application/x-tex">
          % \\f is defined as #1f(#2) using the macro
          \\f\\relax{x} = \\int_{-\\infty}^\\infty
          \\f\\hat\\xi\\,e^{2 \\pi i \\xi x}
          \\,d\\xi
        </annotation>
      </semantics>
    </math>`
})
</script>

<template>
  <!-- Edit this file to play around with Nuxt but never commit changes! -->
  <div>
    <CustomElementComponent />
    <Helloworld id="hello-world" />
    <ComponentDefinedInSetup id="component-defined-in-setup" />
    <button id="increment-count" @click="count++">
      {{ count }}
    </button>
    <template v-if="!pending">
      <Name id="name" template="<div>I am the Name.ts component</div>" />
      <show-template id="show-template" :template="data?.templateString ?? ''" name="Julien" />
      <Interactive id="interactive" lastname="Huang" firstname="Julien" />
    </template>
    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
      <semantics>
        <mrow>
          <mi>f</mi><mo stretchy="false">
            (
          </mo><mi>x</mi><mo stretchy="false">
            )
          </mo><mo>=</mo><msubsup>
            <mo>∫</mo><mrow>
              <mo>−</mo><mi mathvariant="normal">
                ∞
              </mi>
            </mrow><mi mathvariant="normal">
              ∞
            </mi>
          </msubsup><mover accent="true">
            <mi>f</mi><mo>^</mo>
          </mover><mo stretchy="false">
            (
          </mo><mi>ξ</mi><mo stretchy="false">
            )
          </mo><msup><mi>e</mi><mrow><mn>2</mn><mi>π</mi><mi>i</mi><mi>ξ</mi><mi>x</mi></mrow></msup><mi>d</mi><mi>ξ</mi>
        </mrow><annotation encoding="application/x-tex">
          % \\f is defined as #1f(#2) using the macro
          \\f\\relax{x} = \\int_{-\\infty}^\\infty
          \\f\\hat\\xi\\,e^{2 \\pi i \\xi x}
          \\,d\\xi
        </annotation>
      </semantics>
    </math>
  </div>
</template>

<style>
.border {
  border: 1px solid burlywood;
}
</style>
