import React from 'react';
import { connect } from 'dva';
import { Layout } from 'antd';
import BaseComponent from 'components/BaseComponent';
import style from './index.module.less';
const { Content } = Layout;

@connect()
export default class extends BaseComponent {
  render() {
    return (
      <Layout className="full-layout page transfer-tree-page">
        <Content className={style.className}>空白页</Content>
      </Layout>
    );
  }
}