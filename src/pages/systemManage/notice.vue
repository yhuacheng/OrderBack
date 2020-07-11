<template>
  <div>
    <quill-editor v-model="content" ref="myQuillEditor" class="editor" :options="editorOption">
    </quill-editor>
    <div class="mt50 txtCenter">
      <el-button type="primary" size="medium" @click='submit'>提 交</el-button>
    </div>
  </div>
</template>
<script>
  import {
    noticeAdd,
    noticeGet
  } from '@/api/api'

  import {
    quillEditor
  } from 'vue-quill-editor'
  import 'quill/dist/quill.core.css'
  import 'quill/dist/quill.snow.css'
  import 'quill/dist/quill.bubble.css'

  import * as Quill from 'quill'
  let fontSizeStyle = Quill.import('attributors/style/size')
  fontSizeStyle.whitelist = ['12px', '14px', '16px', '20px', '24px', '36px']
  Quill.register(fontSizeStyle, true)

  // 工具栏配置
  const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
    [{
      color: []
    }, {
      background: []
    }], // 字体颜色、字体背景颜色
    // ['blockquote', 'code-block'], // 引用  代码块
    [{
      header: 1
    }, {
      header: 2
    }], // 1、2 级标题
    [{
      list: 'ordered'
    }, {
      list: 'bullet'
    }], // 有序、无序列表
    // [{ script: 'sub' }, { script: 'super' }], // 上标/下标
    [{
      indent: '-1'
    }, {
      indent: '+1'
    }], // 缩进
    // [{'direction': 'rtl'}], // 文本方向
    [{
      size: ['12px', '14px', '16px', '20px', '24px', '36px']
    }], // 字体大小
    [{
      header: [1, 2, 3, 4, 5, 6, false]
    }], // 标题
    [{
      font: []
    }], // 字体种类
    [{
      align: []
    }], // 对齐方式
    ['clean'], // 清除文本格式
    ['image'] // 链接、图片、视频-----['link', 'image', 'video']
  ]
  export default {
    components: {
      quillEditor
    },
    data() {
      return {
        content: '',
        editorOption: {
          placeholder: '请输入公告内容...',
          theme: 'snow',
          modules: {
            toolbar: {
              container: toolbarOptions
            }
          }
        }
      }
    },
    created() {
      this.getData()
    },
    methods: {
      //获取公告内容
      getData() {
        let _this = this
        let params = {}
        noticeGet(params).then(res => {
          _this.content = res[0].Notice
        }).catch((e) => {})
      },

      //提交公告
      submit() {
        let _this = this
        let params = {
          Notice: _this.content
        }
        noticeAdd(params).then(res => {}).catch((e) => {})
      }
    }
  }
</script>
<style>
  .editor {
    height: 360px;
    padding-bottom: 20px;
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item::before {
    content: '14px';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="12px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="12px"]::before {
    content: '12px';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="16px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="16px"]::before {
    content: '16px';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="20px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="20px"]::before {
    content: '20px';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="24px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="24px"]::before {
    content: '24px';
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="36px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="36px"]::before {
    content: '36px';
  }

  .ql-snow .ql-picker.ql-header .ql-picker-label::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item::before {
    content: '文本';
  }

  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
    content: '标题1';
  }

  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
    content: '标题2';
  }

  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
    content: '标题3';
  }

  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
    content: '标题4';
  }

  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
    content: '标题5';
  }

  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
    content: '标题6';
  }

  .ql-snow .ql-picker.ql-font .ql-picker-label::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item::before {
    content: '标准字体';
  }

  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=serif]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=serif]::before {
    content: '衬线字体';
  }

  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=monospace]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=monospace]::before {
    content: '等宽字体';
  }
</style>
