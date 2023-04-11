<template>
    <div class="ez-input" :class="{
        'ez-input--disabled': disabled,
        'ez-input--readonly': readonly,
        'ez-input--loading': loading,
    }">
        <slot name="prepend">
            <div class="ez-input__icon ez-input__icon--prepend" :class="prependIcon" />
        </slot>
        <div class="ez-input__container">
            <slot name="prefix">
                <div v-if="prefixIcon" class="ez-input__icon ez-input__icon--prefix" @click="focus" :class="prefixIcon" />
            </slot>
            <input ref="input" class="ez-input__input" v-model="val"
                :type="(type === 'password' && showPassword) ? (passwordVisible ? 'text' : 'password') : type"
                :placeholder="placeholder" :disabled="disabled" size="1" :readonly="readonly" />
            <slot name="suffix" :passwordVisible="passwordVisible" :togglePassword="togglePassword">
                <div v-if="showPassword && type === 'password'" :class="{
                    'i-ri-eye-off-line': !passwordVisible,
                    'i-ri-eye-line': passwordVisible
                }" class="cursor-pointer" @click="togglePassword"></div>
                <div v-else-if="suffixIcon" class="ez-input__icon ez-input__icon--suffix" @click="focus"
                    :class="suffixIcon" />
            </slot>
        </div>
        <slot name="append">
            <div class="ez-input__icon ez-input__icon--append" :class="appendIcon" />
        </slot>
    </div>
</template>
<script setup>
const props = defineProps({
    type: {
        type: String,
        default: 'input'
    },
    placeholder: {
        type: String,
        default: ''
    },
    value: {
        type: String,
        default: ''
    },
    modelValue: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    prependIcon: {
        type: String,
        default: ''
    },
    appendIcon: {
        type: String,
        default: ''
    },
    prefixIcon: {
        type: String,
        default: ''
    },
    suffixIcon: {
        type: String,
        default: ''
    },
    showPassword: {
        type: Boolean,
        default: true
    }
})
const emits = defineEmits(['update:modelValue'])
const input = ref()
const passwordVisible = ref(false)

const val = computed({
    get() {
        return props.modelValue || props.value
    },
    set(value) {
        emits('update:modelValue', value)
    }
})

const focus = () => {
    input.value.focus()
}

const togglePassword = () => {
    passwordVisible.value = !passwordVisible.value
}

</script>
<style lang="scss" scoped>
.ez-input {
    @apply flex items-center;

    &--disabled {
        @apply cursor-not-allowed;

        input {
            @apply cursor-not-allowed;
        }
    }

    &--readonly {
        @apply cursor-default;

        input {
            @apply cursor-default;
        }
    }

    &--loading {
        @apply cursor-wait;

        input {
            @apply cursor-wait;
        }
    }

    &__container {
        @apply flex items-center justify-center flex-1;
        @apply border;
    }

    &__icon {
        &--prefix {}

        &--suffix {}

        &--prepend {}

        &--append {}
    }

    &__input {
        @apply flex-1 w-full;
        @apply border-none outline-none;
    }
}
</style>
