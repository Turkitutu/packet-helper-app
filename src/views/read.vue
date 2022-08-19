<template>
  <div class="content" ref="content">
    <h3>Data</h3>
    <el-input
      v-model="hexData"
      :rows="3"
      type="textarea"
      placeholder="Put your hex here"
    />

    <h3>The structure</h3>
    <draggable
      v-model="structureList"
      item-key="id"
      ghost-class="ghost"
      animation="200"
    >
      <template #item="{ element }">
        <el-card class="struct-card" shadow="always">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-select
                v-model="element.type"
                class="m-2"
                placeholder="Select the type"
              >
                <el-option
                  v-for="item in typeList"
                  :key="item.key"
                  :label="item.name"
                  :value="item.key"
                />
              </el-select>
            </el-col>
            <el-col :span="16">
              <el-input
                class="struct-input"
                v-model="element.value"
                :disabled="element.type == ''"
                :placeholder="element.type == '' ? 'No Data' : ''"
              />
            </el-col>
            <el-col :span="2" class="m-2">
              <el-button
                v-if="structureList.length != 1"
                type="danger"
                @click="deleteStruct(element.id)"
                plain
                :icon="Delete"
                circle
              ></el-button>
            </el-col>
          </el-row>
        </el-card>
      </template>
    </draggable>
    <div class="add-struct">
      <el-button type="info" plain @click="addNewStruct()">Add item</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import Packet from "@/helpers/packet";
import draggable from "vuedraggable";
import { Delete } from "@element-plus/icons-vue";

interface Structure {
  id: number;
  name: string;
  type: string;
  value: string;
}

export default defineComponent({
  name: "packet-read",
  components: { draggable },
  setup() {
    let id_increment = 0;
    const textarea = ref("");
    const content = ref<HTMLDivElement | null>(null);

    const readStruct = (packet: Packet, type: string) => {
      if (type == "byte") return String(packet.readByte());
      else if (type == "short") return String(packet.readShort());
      else if (type == "int32") return String(packet.readInt());
      else if (type == "int64") return String(packet.readLong());
      return "";
    };

    const hexData = ref(
      "476c6f62616c5f4c6976655f312e302e3234000079617473756b69000000000000000000000000000000000000000000000000000000000000000000000000000000000000003134313139356c75666679403535000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000"
    );

    const structureList = ref<Structure[]>([
      { id: id_increment++, name: "hello", type: "", value: "" },
    ]);

    watch(hexData, () => {
      hexData.value = hexData.value.replace(/ /g, "").replace(/\n/g, "");
    });

    watch(
      structureList,
      () => {
        const packet = new Packet(Buffer.from(hexData.value, "hex"));
        return structureList.value.map((s) => {
          const value = readStruct(packet, s.type);
          console.log(s.type, value);
          s.value = s.type ? value : "";
          return s;
        });
      },
      { deep: true }
    );

    const typeList = [
      { name: "Byte", key: "byte" },
      { name: "Short", key: "short" },
      { name: "Int32", key: "int32" },
      { name: "Int64", key: "int64" },
    ];

    const addNewStruct = () => {
      structureList.value.push({
        id: id_increment++,
        name: "hello",
        type: "",
        value: "",
      });
      content.value?.scrollIntoView({ behavior: "smooth" });
    };

    const deleteStruct = (id: number) => {
      structureList.value = structureList.value.filter((item) => item.id != id);
    };

    return {
      textarea,
      structureList,
      typeList,
      hexData,
      Delete,
      deleteStruct,
      addNewStruct,
      content,
    };
  },
});
</script>

<style scoped>
.content {
  max-width: 900px;
  margin: auto;
}

h3 {
  font-weight: 300;
}

.struct-card {
  margin-top: 5px;
  width: 100%;
}

.struct-input {
  width: 100%;
}

.add-struct {
  margin: 0 auto;
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.add-struct .el-button {
  min-width: 400px !important;
}
</style>
