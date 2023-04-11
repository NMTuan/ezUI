<!--
 * @Author: NMTuan
 * @Email: NMTuan@qq.com
 * @Date: 2023-04-10 15:11:54
 * @LastEditTime: 2023-04-11 11:45:35
 * @LastEditors: NMTuan
 * @Description: 
 * @FilePath: \ezUI\pages\components\input\index.vue
-->
<template>
    <div>
        <ez-input v-model="value"></ez-input>
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
        {{ value }}
        {{ date }}
        {{ time }}
        {{ file }}
    </div>
</template>
<script setup>
const value = ref('123')
const date = ref('2023-04-05')
const time = ref('12:12')
const file = ref()
</script>
