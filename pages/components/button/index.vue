<!--
 * @Author: NMTuan
 * @Email: NMTuan@qq.com
 * @Date: 2023-04-06 14:35:07
 * @LastEditTime: 2023-04-10 15:04:55
 * @LastEditors: NMTuan
 * @Description: 
 * @FilePath: \ezUI\pages\components\button\index.vue
-->
<template>
    <div>
        <hr class="my-4" />
        <ez-button @click="click" :loading="loading" :loading-hide-content="false"
            icon="i-ri-share-box-line">这是一个按钮</ez-button>
        <ez-button @click="click" :loading="loading" disabled>这是一个按钮disabled</ez-button>
        <ez-button @click="click" :loading="loading" :disabled="true">这是一个按钮disabled=true</ez-button>
        <ez-button @click="click" :loading="loading" suffix-icon="i-ri-home-line" :loading-hide-content="false"
            behind-loading>
        </ez-button>
        <ez-button @click="click" :loading="loading" icon="i-ri-home-fill" suffix-icon="i-ri-home-2-line">
            这是一个按钮
        </ez-button>
        <hr class="my-4" />
        <my-button :loading="loading" type="default"> 11 </my-button>
        <my-button :loading="loading" type="primary">22</my-button>
        <my-button disabled :loading="loading" type="secondary">33</my-button>
        <my-button type="success" icon="i-ri-home-2-line" suffix-icon="i-ri-home-2-line">44</my-button>
        <my-button disabled type="warning">55</my-button>
        <my-button type="danger">66</my-button>
        <my-button disabled type="info">77</my-button>
        <hr class="my-4" />
        <my-button disabled :loading="loading" light type="default">
            11
        </my-button>
        <my-button disabled :loading="loading" light type="primary">22</my-button>
        <my-button disabled :loading="loading" light type="secondary">33</my-button>
        <my-button disabled light type="success" suffix-icon="i-ri-home-2-line">44</my-button>
        <my-button disabled light type="warning">55</my-button>
        <my-button disabled light type="danger">66</my-button>
        <my-button disabled light type="info">77</my-button>
        <hr class="my-4" />
        <my-button icon="i-ri-home-2-line" suffix-icon="i-ri-home-2-line" type="primary" size="xs">xs很小</my-button>
        <my-button icon="i-ri-home-2-line" suffix-icon="i-ri-home-2-line" type="primary" size="sm">sm较小</my-button>
        <my-button icon="i-ri-star-fill" type="primary">收藏</my-button>
        <my-button suffix-icon="i-ri-star-fill" type="primary">收藏</my-button>
        <my-button icon="i-ri-star-fill" type="primary"></my-button>
        <my-button suffix-icon="i-ri-star-fill" type="primary"></my-button>
        <my-button loading :loading-hide-content="false" icon="i-ri-home-2-line" suffix-icon="i-ri-home-2-line"
            type="primary" size="lg">
            lg较大
        </my-button>
    </div>
</template>
<script setup>
const loading = ref(false)
const click = () => {
    console.log('[click]')
    loading.value = true
    setTimeout(() => {
        loading.value = false
    }, 3000)
}
</script>
