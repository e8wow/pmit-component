<template>
    <div class="demo-layout">
        <Sider class="sider">
            <Menu class="menu" width="auto" theme="light" @on-select="handlerSelectedMenu"
                  :active-name="selectedMenuName">
                <template v-for="menu in menusData">
                    <MenuGroup v-if="menu.items" :title="menu.text">
                        <template slot="title">
                            <Icon class="menu__icon" v-if="menu.icon" :type="menu.icon"/>
                            {{menu.text}}
                        </template>
                        <MenuItem v-for="item in menu.items" :name="item.name" :key="item.name">
                            <Icon class="menu__icon" v-if="item.icon" :type="item.icon"/>
                            {{item.text}}
                        </MenuItem>
                    </MenuGroup>
                    <MenuItem v-else :name="menu.name">
                        <Icon class="menu__icon" v-if="menu.icon" :type="menu.icon"/>
                        {{menu.text}}
                    </MenuItem>
                </template>
            </Menu>
        </Sider>
        <Layout class="layout">
            <router-view ref="router-view"></router-view>
        </Layout>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {Component} from 'vue-property-decorator'

    @Component({
        metaInfo: {}
    })
    export default class Demo extends Vue {
        private menusData = [
            {
                name: 'install',
                icon: 'monitor',
                text: '安装',
                path: '/demo/install'
            },
            {
                icon: 'ios-book-outline',
                text: '高级组件',
                items: [
                    {
                        name: 'photo-gallery',
                        icon: 'ios-list-outline',
                        text: '图片库',
                        path: '/demo/photo-gallery'
                    }
                ]
            }
        ]

        get selectedMenuName(): string { // 计算属性
            const len = this.$route.matched.length
            return this.$route.matched[len - 1].name || ''
        }

        private handlerSelectedMenu(name: string): void {
            this.$router.push({name})
        }
    }
</script>

<style lang="scss">
    .demo-layout {
        border: 1px solid #d7dde4;
        background: #f5f7f9;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
        min-height: 100%;
        .ivu-layout-sider.sider {
            position: fixed;
            height: 100vh;
            left: 0;
            overflow: auto;
        }
        .ivu-menu.menu {
            min-height: 100%;
        }
        .ivu-layout.layout {
            margin-left: 200px;
            min-height: 100vh;
            background: #fff;
            padding: 24px;
        }
    }
</style>
