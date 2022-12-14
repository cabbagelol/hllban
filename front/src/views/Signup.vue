<template>
  <div class="container">
    <div class="content">
      <br>
      <Row>
        <Col :xs="{push: 1}" :lg="{push: 0}">
          <Breadcrumb>
            <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
            <BreadcrumbItem>{{ $t("signup.title") }}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <br>

      <Card dis-hover>
        <Steps :current="stepsIndex" slot="title" v-if="!isMobile">
          <Step :title="$t('signup.steps[0].title')" :content="$t('signup.steps[0].supplement')"></Step>
          <Step :title="$t('signup.steps[1].title')" :content="$t('signup.steps[1].title')"></Step>
          <Step :title="$t('signup.steps[2].title')" :content="$t('signup.steps[2].title')"></Step>
          <Step :title="$t('signup.steps[3].title')" :content="$t('signup.steps[3].title')"></Step>
          <Step :title="$t('signup.steps[4].title')" :content="$t('signup.steps[4].title')"></Step>
        </Steps>

        <Row :gutter="isMobile ? 0 : 30">
          <Col span="24">
            <template v-if="stepsIndex == 0">
              <Alert type="info" show-icon>
                <div v-html="$t('signup.eaPrivacy')"></div>
                {{ $t('signup.checkAllEmail') }}
              </Alert>
              <br>
            </template>
            <Alert type="error" show-icon v-if="backServiceMsg">
              <b>{{ $t('signup.failed') }} :</b>
              {{ backServiceMsg }}
            </Alert>

            <Form ref="formValidate" label-position="top" :model="signup" :rules="ruleValidate">
              <div v-show="stepsIndex == 0">
                <FormItem :label="$t('signup.form.username')" prop="username">
                  <Input v-model="signup.username" maxlength="40" size="large"
                         :placeholder="$t('signup.placeholder.username')"/>
                </FormItem>
                <FormItem :label="$t('signup.form.password')" prop="password">
                  <Input type="password" password minlength="6" v-model="signup.password" size="large"
                         :placeholder="$t('signup.placeholder.password')"/>
                </FormItem>
              </div>

              <div v-show="stepsIndex === 1">
                <FormItem :label="$t('signup.form.email')" prop="email">
                  <Input v-model="signup.email" size="large"
                         :placeholder="$t('signup.placeholder.email')"/>
                </FormItem>
              </div>

              <div v-show="stepsIndex === 2">
                <FormItem :label="$t('captcha.title')" prop="captcha">
                  <Input type="text" v-model="signup.captcha"
                         size="large"
                         maxlength="4"
                         :placeholder="$t('captcha.title')">
                    <div slot="append" class="captcha-input-append" :alt="$t('captcha.get')">
                      <Captcha ref="captcha"></Captcha>
                    </div>
                  </Input>
                </FormItem>
              </div>

              <div v-show="stepsIndex === 3">
                <Card dis-hover>
                  <Row :gutter="16" type="flex" justify="center" align="middle">
                    <Col>
                      <Icon type="md-cloud" color="#535353" size="80"/>
                    </Col>
                    <Col>
                      <Icon type="md-return-right" color="#aaa" size="30"/>
                    </Col>
                    <Col>
                      <Icon type="md-mail" color="#535353" size="80"/>
                    </Col>
                  </Row>
                </Card>
                <br>
                <Alert type="success" show-icon>{{ $t('signup.needVerify') }}</Alert>
              </div>

              <Row v-show="stepsIndex <= 2">
                <Col flex="auto">
                  <Button v-if="stepsIndex >=0 && stepsIndex <= 2"
                          :disabled="stepsIndex == 0"
                          @click.prevent.stop="stepsIndex--" size="large">{{ $t('basic.button.prev') }}
                  </Button>
                  <Divider type="vertical"/>
                  <Button v-if="stepsIndex != 2  && stepsIndex >= 0 && stepsIndex <= 2"
                          @click.prevent.stop="stepsIndex++" size="large"
                          type="primary">{{ $t('basic.button.next') }}
                  </Button>
                </Col>
                <Col flex="auto" align="right" type="flex">
                  <!-- ????????????-????????? -->
                  <template v-if="stepsIndex == 2">
                    <Button
                        @click="onSignup"
                        :disabled="!signup.captcha"
                        :loading="spinShow"
                        long
                        size="large"
                        type="primary">
                      {{ $t('basic.button.submit') }}
                    </Button>
                  </template>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>

        <template v-if="stepsIndex <= 2">
          <br>
          <Row type="flex" justify="center" align="middle" >
            <Col>
              <router-link :to="{name: 'signin'}">{{ $t('signup.form.submitHint') }}</router-link>
            </Col>
            <Divider type="vertical"/>
            <Col>
              <router-link :to="{name: 'forgetPassword'}">{{ $t('signup.form.forgetPasswordHint') }}</router-link>
            </Col>
          </Row>
        </template>
      </Card>
    </div>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";

import {http, api, http_token, mail} from '../assets/js/index'
import {testWhitespace} from "@/mixins/common";

import EmailTip from "../components/EmailTip";
import Captcha from "../components/Captcha";

import _ from "lodash";

export default new BFBAN({
  data() {
    return {
      stepsIndex: 0,
      ruleValidate: {
        username: [
          {required: true, min: 4, max: 40, trigger: 'blur'}
        ],
        password: [
          {required: true, min: 6, max: 40, trigger: 'blur'}
        ],
        email: [
          {required: true, type: 'email', trigger: 'change'}
        ],
        captcha: [
          {required: true, min: 4, max: 4, trigger: 'change'}
        ]
      },
      signup: {
        username: '',
        password: '',
        email: '',
        captcha: '',
      },
      backServiceMsg: '',
      spinShow: false,
    }
  },
  components: {EmailTip, Captcha},
  created() {
    this.http = http_token.call(this);
  },
  methods: {
    // ??????????????????
    onSignup() {
      const that = this;
      this.$refs['formValidate'].validate(valid => {
        let {username, password, email, captcha} = this.signup;

        // ????????????
        if (!valid) {
          this.$Message.info(this.$i18n.t('signup.fillIn'));
          return;
        }

        this.spinShow = true;

        http.post(api["account_signup"], {
          data: {
            data: {
              username,
              password,
              email,
              language: mail.exchangeLangField(this.$root.$i18n.locale)
            },
            encryptCaptcha: this.$refs.captcha.hash,
            captcha
          }
        }).then(res => {
          const d = res.data;

          if (d.success === 1) {
            that.stepsIndex += 1;
            that.$Message.success({
              content: this.$i18n.t('signup.needVerify'),
              duration: 10
            });
            return;
          }

          this.callbackMessage(d);
          this.onCleanSignupForm({originEmail: false, originName: false, stepsIndex: false})
        }).catch(err => {
          this.$Message.error(err);
          this.backServiceMsg = this.$i18n.t('signup.failed');

          this.onCleanSignupForm();
        }).finally(() => {
          this.spinShow = false;

          if (this.$refs.captcha)
            this.$refs.captcha.refreshCaptcha();
        });
      })
    },

    // ??????????????????
    onCleanSignupForm({
                        captcha = true,
                        username = true,
                        password = true,
                        email = true,
                        stepsIndex = true
                      }) {
      if (captcha)
        this.signup.captcha = '';
      if (username)
        this.signup.username = '';
      if (password)
        this.signup.password = '';
      if (email)
        this.signup.email = '';
      if (stepsIndex)
        this.stepsIndex = 0;
    },

    // ??????[Signup]???????????????
    // ???????????????
    callbackMessage(data) {
      const that = this;

      // ??????
      switch (data.code) {
        case "signup.needVerify": // ????????????
          that.$Message.info(this.$i18n.t('signup.needVerify'));
          break;
        case "signup.gameNotShowed": // ???????????????????????????
          that.$Message.info(this.$i18n.t('signup.gameNotShowed'));
          break;
        case "signup.originBindingExist": // ?????????????????????BFBAN??????
          that.$Message.info(this.$i18n.t('signup.originBindingExist'));
          break;
        case "signup.originNotFound": // ?????????????????????
          that.$Message.info(this.$i18n.t('signup.originNotFound'));
          break;
        case "signup.usernameExist": // ?????????????????????
          that.$Message.info(this.$i18n.t('signup.usernameExist'));
          break;
        case "signup.notImplement":
        case "signup.bad":
        case "signup.error":
        default:
          that.$Message.error(data.code);
          that.backServiceMsg = data.message || data.code;
          break;
      }

      // ?????????
      if (data.code.indexOf('captcha') >= 0) {
        let captcha_code = data.code.split('.')[1];
        let captcha_text = this.$i18n.t(`captcha.messages.${captcha_code}`);
        if (captcha_code == 'gan') return;
        that.$Message.error({content: captcha_text, duration: 6});
        that.backServiceMsg += `,${captcha_text}`;
      }
    }
  }
});
</script>

<style lang="less">

</style>
