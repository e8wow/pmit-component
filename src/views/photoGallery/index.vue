<template>
    <article>
        <h1>photo-gallery 图片库</h1>
    </article>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {Component} from 'vue-property-decorator'

    @Component({
        metaInfo: {
            title: '图片库'
        }
    })
    export default class PhotoGallery extends Vue {
    }
</script>

<style>

</style>
