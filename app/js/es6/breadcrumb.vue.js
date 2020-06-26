/**
 * Author: Viktor Boyko
 * Version: 0.1
 */

// breadcrumb
Vue.component('breadcrumb-data', {

  props: ['breadcrumb', 'index', 'mark', 'len'],
  template: `
    <span  v-html="addRoute(breadcrumb)" property="itemListElement" typeof="ListItem">
      <meta property="position" content="breadcrumb.position">
    </span>
    `,

  methods: {
    addMark(index) {
      let marker = (index < this.len - 1) ? this.mark : '';
      return marker;
    },

    addRoute(obj) {
      let response,
        meta = '<span property="name">' + obj.name + '</span>',
        tag = 'a'; //default tag

      if (obj.item !== undefined && obj.item !== "") {
        response = '<' + tag + ' property="item" typeof="WebPage" href="' + obj.item + '"' + (obj.target ? "target=_blank" : "") + '>' + meta + '</' + tag + '>';
      } else {
        tag = 'span';
        response = '<' + tag + ' property="item" typeof="WebPage">' + meta + '</' + tag + '>';
      }
      let responseWithMark = response + this.addMark(this.index);
      return responseWithMark;
    }
  }
});

// Vue Apps [breadcrumb]
let app1 = new Vue({
  el: '#v-breadcrumb',
  data: {

    // Setting component
    breadcrumb: true,

    // Status
    load: false,
    message: "Test",
    mark: " " + "→" + " ",

    // For init start render template
    breadcrumbList: [{ "itemListElement": [] }],

    urls: {
      news: 'http://localhost:3002/routes',
    },
  },

  methods: {

    lenObj(obj) {
      if (obj[0].itemListElement !== undefined) {
        let len = Object.keys(obj[0].itemListElement).length;
        return len;

      } else {
        return false;
      }

    },

    async getRoutes() {
      let json_data = await axios.get(this.urls.news);
      return json_data;
    },
  },


  async mounted() {

    let cookie = $.cookie('session-key');
    let url = "http://localhost:3002/events_user?session-key=" + cookie;
    await axios
      .get(url)
      .then(response => {
        this.breadcrumb = response.data[0].breadcrumb;
      });

    try {
      let resp = await this.getRoutes();
      if (resp.status == 200) {
        console.log('%cStatus: ' + resp.status + ', data successfully loaded', 'color: #43852f');
        this.load = true;

        this.breadcrumbList = [];
        this.breadcrumbList.push(resp.data);
      } else {
        console.log(resp.status);
      }
    }
    catch (err) {
      console.error("Error loading json obj on url: " + this.urls.news + ' name: ' + err.name);
    };
  },
});
