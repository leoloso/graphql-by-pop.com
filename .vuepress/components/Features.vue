<template>
  <div
    class="features-wrapper"
  >
    <h1
      v-if="title"
    >
      {{ title }}
    </h1>
    <div
      class="features"
    >
      <div
        v-for="(feature, index) in items"
        :key="index"
        class="feature"
      >
        <div
          v-if="feature.icon"
          class="[ feature__img emoji--8 ]"
          aria-hidden="true"
        >
          {{ feature.icon }}
        </div>
        <div
          v-if="feature.image"
          class="[ feature__img ]"
          aria-hidden="true"
        >
          <img :src=feature.image>
        </div>
        <div class="[ feature__text ]">
          <h2
            v-if="title"
          >
            {{ feature.title }}
          </h2>
          <h1 v-else>{{ feature.title }}</h1>
          <p>{{ feature.details }}</p>

          <div class=""
              v-if="feature.actions"          
          >
            <ActionButton
              v-for="(action, actionIndex) in feature.actions"
              :key="actionIndex"
              class="action"
              :title="action.text"
              :link="action.link"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ActionButton from './ActionButton.vue'

export default {
  name: 'Features',

  components: { ActionButton },

  props: {
    title: {
      required: false
    },
    items: {
      required: true
    }
  },

  computed: {
    data () {
      return {
        title: '',
        items: []
      }
    }
  },
}
</script>

<style lang="stylus">
.features
  border-top 1px solid $borderColor
  padding 1.2rem 0
  margin-top 2.5rem
  // display flex
  // flex-wrap wrap
  // align-items flex-start
  // align-content stretch
  // justify-content space-between
.feature
  // flex-grow 1
  // flex-basis 30%
  // max-width 30%
  h2
    font-size 1.4rem
    font-weight 500
    border-bottom none
    padding-bottom 0
    color lighten($textColor, 10%)
  p
    color lighten($textColor, 25%)

.features-wrapper.flex-list
  .features
    display block !important
  .feature
    max-width 100% !important
    border-top 1px dashed var(--borderColor)
    padding 15px 0
  .feature:first-child
    border-top 0
    padding-top 0

@media (min-width: $MQMobile)    
  .features-wrapper.flex-list
    .feature
      display flex
      // flex-wrap wrap
      // align-items flex-start
      // align-content stretch
      // justify-content space-between
    // .feature__img
    //   flex-grow 1
    //   flex-basis 20%
    //   max-width 20%
    .feature__text
      // flex-grow 1
      // max-width 75%
      text-align left
      padding-left 30px

.features-wrapper.flex-inline
  .features
    display flex
    flex-wrap wrap
    align-items flex-start
    align-content stretch
    justify-content space-between
  .feature
    flex-grow 1
    flex-basis 30%
    max-width 30%
      
@media (max-width: $MQMobile)
  .home
    .features-wrapper.flex-inline
      .features
        flex-direction column
      .feature
        max-width 100%
        padding 0 2.5rem

@media (max-width: $MQMobileNarrow)
  .feature
    h2
      font-size 1.25rem

</style>