<template>
  <div>
    <Topbar v-if="!isDesktop"/>
    <div :id="!isDesktop ? 'content' : ''" class="ns" style="width:100%;height:var(--window-height);box-sizing:border-box;overflow-y:auto">
      <div class="search-container" :class="{scrolled:!isScrolledToTop}">
        <mdui-text-field :placeholder="t('editor.word.search')" clearable class="full-width" variant="filled" v-model="searchText" name="search"></mdui-text-field>
      </div>
      <div @scroll="handleScroll">
        <mdui-list v-if="filteredItems.length">
          <mdui-list-item v-for="(item,index) in filteredItems" :key="item.id">
            <div class="list-item-content" @click="editItem(index)">
              <div class="headline">{{ item.title }}</div>
              <div class="supporting-text">{{ item.description }}</div>
            </div>
            <mdui-dropdown slot="end-icon" style="line-height:normal">
              <mdui-button-icon slot="trigger" @click.stop="openMenu(index,$event)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </mdui-button-icon>
              <mdui-menu dense>
                <mdui-menu-item @click="moveItem(currentIndex,-1)" :disabled="currentIndex===0">
                  <svg slot="icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>
                  {{ t('editor.word.moveUp') }}
                </mdui-menu-item>
                <mdui-menu-item @click="moveItem(currentIndex,1)" :disabled="currentIndex===items.length-1">
                  <svg slot="icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>
                  {{ t('editor.word.moveDown') }}
                </mdui-menu-item>
                <mdui-menu-item @click="confirmDelete(currentIndex)">
                  <svg slot="icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                  {{ t('editor.word.delete') }}
                </mdui-menu-item>
              </mdui-menu>
            </mdui-dropdown>
          </mdui-list-item>
        </mdui-list>
        <div v-else class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2M20 16H5.2L4 17.2V4H20V16Z"/>
          </svg>
          <div class="empty-text">{{ t('editor.word.emptyMessage') }}</div>
        </div>
      </div>
      <mdui-fab class="add-btn" variant="primary" @click="openDialog">
        <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      </mdui-fab>
      <mdui-dialog :open="dialogOpen" @close="closeDialog">
        <div class="dialog-content">
          <mdui-text-field :label="t('editor.word.title')" :value="currentItem.title" variant="filled" name="title" @change="currentItem.title = $event.target.value"></mdui-text-field>
          <mdui-text-field :label="t('editor.word.description')" :value="currentItem.description" variant="filled" textarea @change="currentItem.description = $event.target.value" name="description"></mdui-text-field>
        </div>
        <mdui-button slot="action" variant="text" @click="closeDialog">{{ t('editor.word.cancel') }}</mdui-button>
        <mdui-button slot="action" variant="filled" @click="saveItem" :disabled="currentItem.description.trim() === ''">{{ t('editor.word.confirm') }}</mdui-button>
      </mdui-dialog>
      <mdui-dialog :open="deleteDialogOpen" @close="deleteDialogOpen=false">
        <div class="dialog-content">{{ t('editor.word.deleteConfirm') }}</div>
        <mdui-button slot="action" variant="text" @click="deleteDialogOpen=false">{{ t('editor.word.cancel') }}</mdui-button>
        <mdui-button slot="action" variant="filled" @click="deleteItem">{{ t('editor.word.delete') }}</mdui-button>
      </mdui-dialog>
    </div>
  </div>
</template>

<script setup>
import {inject,ref,computed,onMounted,onBeforeUnmount} from 'vue'
import {useI18n} from 'vue-i18n'
import Topbar from '../components/Topbar'

const props=defineProps({isDesktop:Boolean,isSidebar:Boolean})
const {t}=useI18n()
const fs=inject("fs")
const items=ref([])
const searchText=ref('')
const dialogOpen=ref(false)
const deleteDialogOpen=ref(false)
const currentIndex=ref(-1)
const currentItem=ref({title:'',description:''})
const descriptionError=ref('')
const isScrolledToTop=ref(true)

const filteredItems=computed(()=>items.value.filter(item=>
  item.title.toLowerCase().includes(searchText.value.toLowerCase())||
  item.description.toLowerCase().includes(searchText.value.toLowerCase())
))

function handleScroll(e){isScrolledToTop.value=e.target.scrollTop===0}
function openDialog(){
  currentItem.value={title:'',description:''}
  dialogOpen.value=true
}
function closeDialog(){
  dialogOpen.value=false
  descriptionError.value=''
}
async function saveItem(){
  const isNew=currentIndex.value===-1
  const newId=isNew?202+items.value.length:items.value[currentIndex.value].id
  if(isNew){
    items.value.push({id:newId,title:currentItem.value.title,description:currentItem.value.description})
  }else{
    items.value[currentIndex.value]={...currentItem.value}
  }
  closeDialog()
  currentIndex.value=-1
  await syncSettingFile()
}
function editItem(index){
  currentIndex.value=index
  currentItem.value={...items.value[index]}
  dialogOpen.value=true
}
function openMenu(index){currentIndex.value=index}
function moveItem(index,direction){
  if((direction===-1&&index===0)||(direction===1&&index===items.value.length-1))return
  const newIndex=index+direction
  const newItems=[...items.value]
  ;[newItems[index],newItems[newIndex]]=[newItems[newIndex],newItems[index]]
  items.value=newItems
  syncSettingFile()
}
function confirmDelete(index){
  currentIndex.value=index
  deleteDialogOpen.value=true
}
async function deleteItem(){
  items.value.splice(currentIndex.value,1)
  deleteDialogOpen.value=false
  currentIndex.value=-1
  await syncSettingFile()
}
function handleKeydown(e){
  if((e.ctrlKey||e.metaKey)&&e.key==='n'){
    e.preventDefault()
    openDialog()
  }
}
async function syncSettingFile(){
  const controls=[]
  const bag={'#property_field':'#item_name','#item_name':''}
  const bindings=[]
  items.value.forEach((item,idx)=>{
    const id=item.id
    controls.push({[`p${idx+1}@ct.v2`]:{}})
    controls.push({[`word_${id}@cube_chat.filling_toggle`]:{
      $control_text:item.title,
      $control_view_name:`word_${id}`,
      $toggle_group_index:id
    }})
    bag[`#item_name_${id}`]=item.description
    bindings.push({
      binding_type:'view',
      source_control_name:`word_${id}`,
      source_property_name:'#toggle_state',
      target_property_name:`#f${id}`
    })
  })
  const sourceExpr=items.value.length
    ?'('+items.value.map(item=>`#f${item.id}*${item.id}`).join('+')+')'
    :'#undefined'
  const settings={
    namespace:'cube_setting',
    cmd_custom_panel:{
      modifications:[{
        array_name:'controls',
        operation:'insert_back',
        value:controls
      }]
    },
    command_filling:{
      $text_edit_box_content_property_bag:bag,
      modifications:[
        {
          array_name:'$text_edit_box_content_bindings',
          where:{target_property_name:'#custom_id'},
          operation:'replace',
          value:{
            binding_type:'view',
            source_property_name:sourceExpr,
            target_property_name:'#custom_id'
          }
        },
        {
          array_name:'$text_edit_box_content_bindings',
          where:{target_property_name:'#f201'},
          operation:'insert_back',
          value:bindings
        }
      ]
    }
  }
  await fs.value.write('ui/_setting.json',settings)
}
async function loadItemsFromSettings(){
  if(!(await fs.value.exist('ui/_setting.json'))){await syncSettingFile();return}
  const settings=await fs.value.read('ui/_setting.json')
  items.value=[]
  if(settings.cmd_custom_panel?.modifications?.[0]?.value){
    settings.cmd_custom_panel.modifications[0].value.forEach(obj=>{
      const key=Object.keys(obj)[0]
      if(key.includes('@cube_chat.filling_toggle')){
        const id=parseInt(key.split('_')[1].split('@')[0])
        const title=obj[key]?.['$control_text']||''
        const desc=settings.command_filling?.$text_edit_box_content_property_bag?.[`#item_name_${id}`]||''
        items.value.push({id,title,description:desc})
      }
    })
  }
}
onMounted(async()=>{
  window.addEventListener('keydown',handleKeydown)
  await loadItemsFromSettings()
})
onBeforeUnmount(()=>window.removeEventListener('keydown',handleKeydown))
</script>

<style scoped>
#content{padding-top:64px!important}
.search-container{position:sticky;top:0;z-index:1000;padding:12px;background:var(--mdui-color-surface);transition:box-shadow .2s ease}
.search-container.scrolled{box-shadow:var(--mdui-elevation-level1)}
.full-width{width:100%}
.add-btn{position:fixed;bottom:24px;right:24px}
.headline{font-weight:500;font-size:16px}
.supporting-text{font-size:14px;color:var(--mdui-color-on-surface-variant);white-space:pre-line}
.dialog-content{display:flex;flex-direction:column;gap:16px}
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;text-align:center;color:var(--mdui-color-on-surface-variant)}
.empty-icon{margin-bottom:16px;opacity:.6}
.empty-text{font-size:16px;max-width:300px;line-height:1.5}
</style>