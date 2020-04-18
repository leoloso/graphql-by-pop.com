const { path } = require('@vuepress/shared-utils')

module.exports = (options = {}, context) => ({
  // define () {
  //   const { siteConfig = {}} = context
  //   const plausibleDomain = options.domain || siteConfig.plausibleDomain
  //   const PLAUSIBLE_DOMAIN = plausibleDomain || false
  //   return { PLAUSIBLE_DOMAIN }
  // },

  enhanceAppFiles: path.resolve(__dirname, 'enhanceAppFile.js')
})
