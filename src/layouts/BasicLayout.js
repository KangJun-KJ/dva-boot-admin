import React from 'react';
import { connect } from 'dva';
import { Layout } from 'antd';
import { Switch, routerRedux } from 'dva/router';
import Notification from 'components/Notification';
import NavBar from 'components/NavBar';
import { LeftSideBar, RightSideBar } from 'components/SideBar';
import TopBar from 'components/TopBar';
import SkinToolbox from 'components/SkinToolbox';
import pathToRegexp from 'path-to-regexp';
import ElementQueries from 'css-element-queries/src/ElementQueries';
import './styles/basic.less';
import $$ from 'cmn-utils';
const { Content, Header } = Layout;

/**
 * 基本部局
 * 可设置多种皮肤 theme: [light, grey, primary, info, warning, danger, alert, system, success, dark]
 * 可设置多种布局 fixed: [header(固定头), sidebar(固定边栏), breadcrumb(固定面包蟹)]
 * @author weiq
 */
@connect()
export default class BasicLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    const menu = $$.getStore('menu', []);
    const user = $$.getStore('user', []);
    const flatMenu = this.flatMenu = this.getFlatMenu(menu);
    this.state = {
      collapsedLeftSide: false, // 左边栏开关控制
      leftCollapsedWidth: 60, // 左边栏宽度
      expandTopBar: false, // 头部多功能区开合
      showSidebarHeader: false, // 左边栏头部开关
      collapsedRightSide: true, // 右边栏开关
      collapsedSkinToolbox: true, // 设置皮肤面板
      /* 皮肤设置 */
      theme: $$.getStore('theme', {
        leftSide: 'darkgrey', // 左边
        navbar: 'light' // 顶部
      }),
      /* 布局设置 */
      fixed: {
        navbar: true
      },
      user,
      menu,
      flatMenu, 
      currentMenu: this.getCurrentMenu(props) || {},
    };
  }

  componentDidMount() {
    ElementQueries.init();  
  }
  
  componentWillMount() {
    // 检查有户是否登录
    const user = $$.getStore('user');
    if (!user) {
      this.props.dispatch(routerRedux.replace('/sign/login'));
    } else {

    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        currentMenu: this.getCurrentMenu(nextProps),
      });
    }
  }

  getCurrentMenu(props) {
    const { location: { pathname } } = props || this.props;
    const menu = this.getMeunMatchKeys(this.flatMenu, pathname)[0];
    return menu;
  }

  getFlatMenu(menus) {
    let menu = [];
    menus.forEach(item => {
      if (item.children) {
        menu = menu.concat(this.getFlatMenu(item.children));
      }
      menu.push(item);
    });
    return menu;
  }

  getMeunMatchKeys = (flatMenu, path) => {
    return flatMenu.filter(item => {
      return pathToRegexp(item.path).test(path);
    });
  };
  
  /**
   * 顶部左侧菜单图标收缩控制
   */
  onCollapseLeftSide = _ => {
    const collapsedLeftSide =
      this.state.leftCollapsedWidth === 0
        ? true
        : !this.state.collapsedLeftSide;
    const collapsedRightSide =
      this.state.collapsedRightSide || !collapsedLeftSide;

    this.setState({
      collapsedLeftSide,
      collapsedRightSide,
      leftCollapsedWidth: 60
    });
  };

  /**
   * 完全关闭左边栏，即宽为0
   */
  onCollapseLeftSideAll = _ => {
    this.setState({
      collapsedLeftSide: true,
      leftCollapsedWidth: 0
    });
  };

  /**
   * 展开面包屑所在条中的多功能区
   */
  onExpandTopBar = _ => {
    this.setState({
      expandTopBar: true
    });
  };

  /**
   * 与上面相反
   */
  onCollapseTopBar = _ => {
    this.setState({
      expandTopBar: false
    });
  };

  /**
   * 切换左边栏中头部的开合
   */
  toggleSidebarHeader = _ => {
    this.setState({
      showSidebarHeader: !this.state.showSidebarHeader
    });
  };

  /**
   * 切换右边栏
   */
  toggleRightSide = _ => {
    this.setState({
      collapsedLeftSide: this.state.collapsedRightSide,
      collapsedRightSide: !this.state.collapsedRightSide
    });
  };

  /**
   * 切换皮肤设置面板
   */
  toggleSkinToolbox = _ => {
    this.setState({
      collapsedSkinToolbox: !this.state.collapsedSkinToolbox
    });
  };

  onChangeTheme = theme => {
    $$.setStore('theme', theme);
    this.setState({
      theme
    });
  };

  render() {
    const {
      collapsedLeftSide,
      leftCollapsedWidth,
      expandTopBar,
      showSidebarHeader,
      collapsedRightSide,
      collapsedSkinToolbox,
      theme,
      user,
      menu,
      flatMenu,
      currentMenu,
    } = this.state;
    const { routerData, location } = this.props;
    const { childRoutes } = routerData;

    return (
      <Layout className="full-layout basic-layout">
        <Header>
          <NavBar
            collapsed={collapsedLeftSide}
            onCollapseLeftSide={this.onCollapseLeftSide}
            onExpandTopBar={this.onExpandTopBar}
            toggleSidebarHeader={this.toggleSidebarHeader}
            theme={theme.navbar}
            user={user}
          />
        </Header>
        <Layout>
          <LeftSideBar
            collapsed={collapsedLeftSide}
            leftCollapsedWidth={leftCollapsedWidth}
            showHeader={showSidebarHeader}
            onCollapse={this.onCollapseLeftSide}
            onCollapseAll={this.onCollapseLeftSideAll}
            location={location}
            theme={theme.leftSide}
            flatMenu={flatMenu}
            currentMenu={currentMenu}
            menu={menu}
            user={user}
          />
          <Content>
            <Layout className="full-layout">
              <Header>
                <TopBar
                  expand={expandTopBar}
                  toggleRightSide={this.toggleRightSide}
                  collapsedRightSide={collapsedRightSide}
                  onCollapse={this.onCollapseTopBar}
                  currentMenu={currentMenu}
                />
              </Header>
              <Content>
                <Switch>{childRoutes}</Switch>
              </Content>
            </Layout>
          </Content>
          <RightSideBar collapsed={collapsedRightSide} />
        </Layout>
        <SkinToolbox
          collapsed={collapsedSkinToolbox}
          toggleSkinToolbox={this.toggleSkinToolbox}
          onChangeTheme={this.onChangeTheme}
          theme={theme}
        />
        <Notification />
      </Layout>
    );
  }
}
