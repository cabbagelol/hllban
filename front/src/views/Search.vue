<template>
  <div class="container">
    <div class="content">
      <br>
      <Row>
        <Col :xs="{push: 1}" :lg="{push: 0}">
          <Breadcrumb>
            <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
            <BreadcrumbItem>{{ $t("search.title") }}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <br>

      <div :class="`search-content ${cheaters.length > 0 ? 'search-content-mini' : ''}`">
        <Row type="flex" justify="center" :gutter="20" style="width: 100%;">
          <Col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 7}">
            <Select v-model="searchScopeValue" size="large" class="search-input-show">
              <Icon type="ios-funnel" slot="prefix" style="margin-left: 10px; margin-right: 5px; opacity: .6"/>
              <Option v-for="i in searchScope" :value="i" :key="i">{{ $t('search.scope.' + i) }}</Option>
            </Select>
          </Col>
          <Col class="desktop-hide" :xs="{span: 24}">&thinsp;</Col>
          <Col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}">
            <div class="search-input search-input-show ivu-input ivu-input-large">
              <Row :gutter="10">
                <Col flex="1">
                  <Dropdown style="width: 100%">
                    <Input
                        size="small"
                        v-model="searchVal"
                        :border="false"
                        :placeholder="$t('search.placeholder')"
                        @on-search="handleSearch">
                    </Input>

                    <!-- Search history S -->
                    <div transfer slot="list">
                      <Row :gutter="5" v-if="searchHistory.list.length > 0" style="padding: 10px">
                        <Col v-for="(i, index) in searchHistory.list"
                             :key="index">
                          <Tag stype="border"
                               type="dot"
                               checkable
                               closable
                               @on-change="handleSearchHistoryClickTag(index)"
                               @on-close="handleSearchHistoryClose(index)">{{ i || '' }}
                          </Tag>
                        </Col>
                      </Row>
                      <div v-else align="center">
                        ????
                      </div>
                    </div>
                    <!-- Search history E -->

                  </Dropdown>
                </Col>
                <Col>
                  <OcrWidget :data="{}" @ok="onOcrOutput">
                    <Tooltip content="OCR">
                      <a href="javascript:void(0)">
                        <Icon type="md-qr-scanner"/>
                      </a>
                    </Tooltip>
                  </OcrWidget>
                </Col>
                <Col>
                  <Button type="primary" size="small" @click="handleSearch">
                    <Icon type="ios-search" v-if="!modalSpinShow"/>
                    <Icon type="md-refresh spin-icon-load" v-else/>
                  </Button>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
        <Row type="flex" justify="center" align="middle" class="checkboxGroup" v-if="cheaters.length <= 0">
          <Col :xs="{span: 24}" :lg="{span: 6}" align="center">
            <Icon type="md-alert"/>
            {{ $t("search.describe") }}
          </Col>
          <Col :xs="{span: 0}" :lg="{span: 1}">
            <Divider type="vertical"/>
          </Col>
          <Col :xs="{span: 24}" :lg="{span: 6}" align="center">
            <a href="javascript:void(0)">{{ $t("search.collectionHint") }}</a>
          </Col>
        </Row>
      </div>

      <div v-if="cheaters.length !== 0">
        <List border class="content">
          <ListItem v-for="(cheater, index) in cheaters" :key="index"
                    @click.native="$router.push({name: 'player', params: {ouid: cheater.originPersonaId}})">
            <ListItemMeta
                :avatar="cheater.avatarLink"
                :title="cheater.currentName || cheater.originName"
                :description="`${cheater.originUserId ? 'uid:' + cheater.originPersonaId : ''} ${cheater.historyName ? $t('search.scope.history') + ':' + cheater.historyName: ''}`"/>
            <router-link :to="{name: 'player', params: {ouid: `${cheater.originPersonaId}`}}" slot="action">
              <div>
                <Icon type="ios-eye" size="30"/>
              </div>
            </router-link>
          </ListItem>

          <Spin size="large" fix v-show="modalSpinShow"></Spin>
        </List>
      </div>
    </div>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";
import OcrWidget from "@/components/OcrWidget";

import {api, http, storage, time} from "../assets/js";

export default new BFBAN({
  name: "search",
  data() {
    return {
      searchVal: '',
      searchHistory: {
        list: []
      },
      modalSpinShow: false,
      searchScope: ['current', 'history'],
      searchScopeValue: 'current',
      cheaters: []
    }
  },
  components: {OcrWidget},
  created() {
    const {s, type} = this.$route.query;
    this.searchScopeValue = type || this.searchScope[0];
    this.searchVal = s || '';

    this.handleSearch();
    this.getSearchHistory();
  },
  methods: {
    getSearchHistory() {
      let history = storage.get('search.history');

      if (history.code == -1) {
        this.setSearchHistoryValue([]);
      }

      this.searchHistory.list = history.data.value || [];
    },
    async setSearchHistoryValue(val) {
      let maxHistory = 10;
      let hostoryList = val;

      for (let i = 0; i < hostoryList.length; i++) {
        if (hostoryList.length > maxHistory) hostoryList.pop();
      }

      storage.set('search.history', hostoryList);
    },
    handleSearchHistoryClose(index) {
      this.searchHistory.list.splice(index, 1);

      this.setSearchHistoryValue(this.searchHistory.list);
    },
    handleSearchHistoryClickTag(index) {
      if (this.modalSpinShow) return;

      this.searchVal = this.searchHistory.list[index];

      this.handleSearch();
    },
    /**
     * Ocr??????
     * @param val
     */
    onOcrOutput(data) {
      this.searchVal = data.value;

      this.handleSearch();
    },
    /**
     * ??????
     */
    handleSearch() {
      const that = this;
      const val = this.searchVal.trim();

      if (val == '' || val.length <= 2 || !this.searchScopeValue || this.modalSpinShow) {
        return;
      }

      this.modalSpinShow = true;

      http.get(api["search"], {
        params: {
          param: val,
          scope: this.searchScopeValue,
        }
      }).then(res => {

        let hisArr = Array.from(new Set(that.searchHistory.list.concat([val])))
        that.setSearchHistoryValue(hisArr);
        that.searchHistory.list = hisArr;

        const d = res.data;

        if (d.success === 1) {
          this.cheaters = d.data;

          if (d.data.length <= 0) {
            this.$Message.info('The player is not found in the database')
          }
          return;
        }

        this.$Message.error(d.code)
      }).finally(() => {
        that.modalSpinShow = false;
      })
    },
  }
});
</script>

<style scoped lang="less">
@import "@/assets/css/icon.less";

.search-background {
  position: fixed;
  background-size: cover;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: .15;
}

.search-content {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  align-content: center;
  transition: all .25s;
  min-height: 600px;
  height: 100%;
  padding: 0 30px;

  &.search-content-mini {
    min-height: 150px !important;
  }

  .checkboxGroup {
    width: 100%;
    margin-bottom: 5px;
    margin-top: 50px;
    font-size: 1rem;
    color: #a8a8a8;
  }

  .search-input-show {
    box-shadow: 0 10px 50px #0000002b;
  }

  .search-input {
    width: 100% !important;
  }
}
</style>