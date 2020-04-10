<template>
  <p
    v-if="title && link"
  >
    <NavLink
      class="action-button"
      :item="actionLink"
    />
  </p>
</template>

<script>
import NavLink from '@theme/components/NavLink.vue'

export default {
  name: 'ActionButton',

  components: { NavLink },

  props: {
    title: {
      required: true
    },
    link: {
      required: true
    }
  },

  computed: {
    data () {
      return {
        title: '',
        link: ''
      }
    },

    actionLink () {
      return {
        link: this.link,
        text: this.title
      }
    }
  }
}
</script>

<style lang="stylus">


</style>