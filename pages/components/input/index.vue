<!--
 * @Author: NMTuan
 * @Email: NMTuan@qq.com
 * @Date: 2023-04-10 15:11:54
 * @LastEditTime: 2023-04-14 14:45:07
 * @LastEditors: NMTuan
 * @Description: 
 * @FilePath: \ezUI\pages\components\input\index.vue
-->
<template>
    <div>
    <!-- <ez-input v-model="value"></ez-input>
        <ez-input v-model="value" placeholder="请输入用户名"></ez-input>
        <ez-input v-model="value" type="password" placeholder="请输入密码"></ez-input>
        <ez-input v-model="time" type="time" placeholder="时间"></ez-input>
        <ez-input :value="date" type="date" placeholder="日历"></ez-input>
                                                                                                    <ez-input v-model="value" disabled placeholder="禁用"></ez-input>
                                                                                                    <ez-input v-model="value" readonly placeholder="只读"></ez-input>
                                                                                                    <ez-input v-model="value" loading placeholder="加载中"></ez-input>
                                                                                                    <ez-input v-model="file" type="file" prepend-icon="i-ri-user-line" placeholder="选择文件"></ez-input>
                                                                                                    <ez-input v-model="value" prepend-icon="i-ri-user-line"></ez-input>
                                                                                                    <ez-input v-model="value" append-icon="i-ri-star-fill"></ez-input>
                                                                                                    <ez-input v-model="value" prefix-icon="i-ri-search-line"></ez-input>
                                                                                                    <ez-input v-model="value" suffix-icon="i-ri-calendar-line"></ez-input>
                                                                                                    <ez-input v-model="value" show-clear placeholder="清空按钮"></ez-input> -->
        <hr class="my-4" />
        {{ value }}
        {{ date }}
        {{ time }}
        {{ file }}
        <hr class="my-4" />
        <div class="flex items-center justify-center mb-1"
            v-for="type in ['', 'default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info']">
            <my-input class="flex-1" v-model="value" :type="type">
            </my-input>
            <my-input class="flex-1" v-model="value" :type="type" disabled>
            </my-input>
            <my-input class="flex-1" v-model="value" :type="type" readonly>
            </my-input>
            <my-button class="flex-1" :type="type">{{ type || 'test' }}</my-button>
            <my-button class="flex-1" :type="type" light>{{ type || 'test' }}</my-button>
            <my-button class="flex-1" :type="type" light disabled>{{ type || 'test' }}</my-button>
        </div>
        <hr class="my-4" />
        <div class="flex items-center justify-center my-4" v-for="size in ['', 'xs', 'sm', 'base', 'lg']">
            <my-input class="flex-1" type="primary" :size="size" v-model="value">
            </my-input>
            <my-button class="flex-1" type="primary" :size="size">
            </my-button>
        </div>

    </div>
</template>
<script setup>
const value = ref('')
const date = ref('2023-04-05')
const time = ref('12:12')
const file = ref()
</script>
