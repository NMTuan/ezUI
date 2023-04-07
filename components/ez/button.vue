<!--
 * @Author: NMTuan
 * @Email: NMTuan@qq.com
 * @Date: 2023-04-06 16:01:43
 * @LastEditTime: 2023-04-07 11:31:06
 * @LastEditors: NMTuan
 * @Description: 
 * @FilePath: \ezUI\components\ez\button.vue
-->
<template>
    <button class="ez-button" :class="{
        'ez-button--loading': loading,
        'ez-button--disabled': disabled
    }" :disabled="disabled">
        <div class="ez-button__container">
            <slot name="icon" v-if="icon && !loading">
                <span class="ez-button__icon ez-button__icon--prefix" :class="icon"></span>
            </slot>
            <slot name="loading" v-if="loading && !behindLoading">
                <span class="ez-button__loading" :class="loadingIcon"></span>
            </slot>
            <slot v-if="!loading || !loadingHideContent"></slot>
            <slot name="suffix-icon" v-if="suffixIcon && !loading">
                <span class="ez-button__icon ez-button__icon--suffix" :class="suffixIcon"></span>
            </slot>
            <slot name="loading" v-if="loading && behindLoading">
                <span class="ez-button__loading" :class="loadingIcon"></span>
            </slot>
        </div>

    </button>
</template>
<script setup>
const props = defineProps({
    disabled: { // 禁用
        type: Boolean,
        default: false
    },
    icon: { // 前置图标，同时对应icon插槽
        type: String,
        default: ''
    },
    suffixIcon: {   // 后置图标，同时对应suffix-icon插槽
        type: String,
        default: ''
    },
    loading: {  // 加载状态
        type: Boolean,
        default: false
    },
    loadingIcon: {  // 加载图标
        type: String,
        default: 'i-ri-loader-4-line '
    },
    behindLoading: {    // 加载放后面
        type: Boolean,
        default: false
    },
    loadingHideContent: {   // 加载时隐藏原本内容
        type: Boolean,
        default: true
    }
})
</script>
<style lang="scss" scoped>
.ez-button {
    @apply cursor-pointer;

    &--disabled {
        @apply cursor-not-allowed;
    }

    &--loading {}

    &__container {
        @apply flex items-center justify-center;
    }

    &__icon {
        &--prefix {}

        &--suffix {}
    }

    &__loading {
        @apply animate-spin;
    }

}
</style>
