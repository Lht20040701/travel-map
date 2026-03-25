<template>
    <nav :style="`height:${height}px`">
        <ElMenu
            :default-active="activeMenu"
            @select="handleMenu"
            @open="handleOpen"
            @close="handleClose"
            :unique-opened="false"
            :collapse="store.isNavMenuFold"
            :collapse-transition="false"
        >
            <template v-for="( submenu, index ) in menus">
                <ElSubMenu v-if="submenu.children && submenu.children.length > 0" :index="submenu.path">
                    <template #title>
                        <ElIcon>
                            <component :is="submenu.meta.icon"/>
                        </ElIcon>
                        <span>{{ submenu.meta.title }}</span>
                    </template>
                    <ElMenuItem
                        :class="{'is-active': menuItem.name === $route.name}"
                        v-for="menuItem in submenu.children"
                        :key="menuItem.path"
                        :index="`${submenu.path}/${menuItem.path}`">{{ menuItem.meta.title }}
                    </ElMenuItem>
                </ElSubMenu>

                <!-- 显示所有名不为 CategoryLink 的-->
                <ElMenuItem
                    v-else-if="submenu.name !== 'CategoryLink'"
                    :index="submenu.path"
                >
                    <ElIcon>
                        <component :is="submenu.meta.icon"/>
                    </ElIcon>
                    <span>{{ submenu.meta.title }}</span>
                </ElMenuItem>
                <!--如果名为 CategoryLink，需要 email === 管理员账户才显示 -->
                <ElMenuItem
                    v-else-if="getAuthorization().group_id === 1"
                    :index="submenu.path"
                >
                    <ElIcon>
                        <component :is="submenu.meta.icon"/>
                    </ElIcon>
                    <span>{{ submenu.meta.title }}</span>
                </ElMenuItem>
            </template>

        </ElMenu>
    </nav>
</template>

<script lang="ts" setup>
import {FIXED_ROUTES} from "../router"
import  {getAuthorization} from "@/utility";
import {onMounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useProjectStore} from "@/store.ts";

const store = useProjectStore()

const route = useRoute()
const router = useRouter()

defineProps<{
    height: number
}>()

const activeMenu = ref('/page-components/canvas')
const menus = ref([])

onMounted(()=>{
    activeMenu.value = route.path
    // 过滤 Router 中的路由，去除 showInMenu === false 的菜单
    let submenuShow = FIXED_ROUTES.filter(submenu => {
        if (submenu.meta.showInMenu){
            if (submenu.meta.isAdmin){
                return store.isAdmin
            } else {
                return true
            }
        } else {
            return false
        }
    })
    submenuShow.forEach(menu => {
        if (menu.children){ // 有子菜单才进行筛选
            menu.children = menu.children.filter(menuItem => menuItem.meta.showInMenu)
        }
        return menu
    })
    menus.value = submenuShow
})

function handleOpen() {
    // 处理导航组展开
}
function handleClose() {
    // 处理导航组折叠
}
function handleMenu(key) {
    // 处理导航点击
    if (route.path !== key) {
        router.push(key);
    }

    // 如果是在移动端，则折叠导航菜单
    if (store.isInPortraitMode) {
        store.isShowFloatingMenuBtn = true
    }
}

watch(route, newValue => {
    activeMenu.value = newValue.path
})

</script>

<style lang="scss">
@import "../scss/variables";

.el-menu {
    border: none;
    background-color: transparent;
}
.el-sub-menu{
    .el-menu-item{
        line-height: 40px;
        height: 40px;
        &:after{
            background-color: var(--theme-border-soft, #{$border-color-nav});
        }
    }
        .el-menu{
            .el-menu-item:hover{
                background-color: var(--theme-menu-sub-bg, rgba(31, 157, 85, 0.08));
            }
        }
    &.is-active{
        background-color: var(--theme-menu-sub-bg, rgba(31, 157, 85, 0.08));
        .el-sub-menu__title{
            color: var(--theme-sidebar-text, #{$text-main});
            &:hover{
                color: white;
            }
        }
        .el-menu{
            .el-menu-item{
                color: var(--theme-sidebar-text, #{$text-main});
                background-color: var(--theme-menu-sub-bg, rgba(31, 157, 85, 0.08));
                &.is-active{
                    color: white;
                    background: linear-gradient(135deg, var(--theme-menu-active-start), var(--theme-menu-active-end));
                    box-shadow: 0 8px 18px rgba(var(--theme-main-rgb), 0.24);
                }
                &:hover{
                    color: white;
                }
            }
        }
    }
    &.is-opened{
        .el-menu{
            &:after{
                background-color: var(--theme-border, #eeeeee);
                content: "";
                position: absolute;
                bottom: 0;
                left: 20px;
                height: 1px;
                width: 100%;
                transform: scaleY(0.5);
            }
        }
    }
}

.el-menu-item, .el-sub-menu__title{
    line-height: 40px !important;
    height: 40px !important;
    font-size: 0.9rem;
    color: var(--theme-sidebar-text, #{$text-main});
    border-bottom: none;
    transition: all 0s;
    i{
        color: inherit;
    }

    &.is-active {
        color: white !important;
        background: linear-gradient(135deg, var(--theme-menu-active-start), var(--theme-menu-active-end));
        box-shadow: 0 8px 18px rgba(var(--theme-main-rgb), 0.24);
        &:hover{
            background: linear-gradient(135deg, var(--theme-menu-active-start), var(--theme-menu-active-end)) !important;
        }
    }
    &:hover{
        color: white;
        background-color: var(--theme-menu-hover-bg, rgba(31, 157, 85, 0.72)) !important;
        transition: all 0s;
    }
    &:after{
        background-color: var(--theme-border-soft, #{$border-color-nav});
        content: '';
        position: absolute;
        bottom: 0;
        left: 20px;
        height: 1px;
        width: 100%;
        transform: scaleY(0.5);
    }
    &:last-child:after{
        content: none;
    }
}
.el-menu--inline{
    .el-menu-item{
        user-select: none;
        padding-left: 50px !important;
    }
}

</style>
