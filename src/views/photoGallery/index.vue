<template>
    <article>
        <h1>photo-gallery 图片库</h1>
        <img-cropper/>
    </article>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {Component, Prop} from 'vue-property-decorator'

    import imgCropper from '@/components/ImageCropper/index.vue'

    @Component({
        components: {
            imgCropper
        },
        metaInfo: {
            title: '图片库'
        }
    })
    export default class PhotoGalleryDemo extends Vue {
    }
</script>

<style>

</style>
