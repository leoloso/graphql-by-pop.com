export default ({ router }) => {
    if (/*process.env.NODE_ENV === 'production' && *//*PLAUSIBLE_DOMAIN && */ typeof window !== 'undefined') {
        (function(w, d, s, o, f, js, fjs) {            
            w[o] = w[o] || function () {
                (w[o].q = w[o].q || []).push(arguments)
            };
            js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
            js.id = o;
            js.src = f;
            js.async = 1;
            // js['data-domain'] = PLAUSIBLE_DOMAIN;
            fjs.parentNode.insertBefore(js, fjs);
        } (window, document, 'script', 'plausible', 'https://plausible.io/js/p.js'))
        
        window.plausible('page')
        window.plausible('trackPushState')
      
        // router.afterEach(function (to) {
        //     window.plausible('page')
        //     window.plausible('trackPushState')
        // })
    }
}

    