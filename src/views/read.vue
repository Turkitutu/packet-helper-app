<template>
  <div class="content" ref="content">
    <h3>Data</h3>
    <el-input
      v-model="hexData"
      @change="onHexDataChange"
      :rows="3"
      type="textarea"
      placeholder="Put your hex here"
    />
    <span v-if="invalidHex" style="color: #f56c6c; font-size: 13px"
      >The hex string data isn't correct! please check it.</span
    >

    <h3>The structure</h3>
    <draggable
      v-model="structureList"
      item-key="id"
      ghost-class="ghost"
      animation="200"
      draggable=".struct-card"
      @dragstart="updateStructureValues()"
      @dragend="updateStructureValues()"
    >
      <template #item="{ element }">
        <el-card class="struct-card" shadow="always">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-select
                @change="onTypeChange(element)"
                v-model="element.type"
                class="m-2"
                placeholder="Select the type"
              >
                <el-option-group label="String">
                  <el-option
                    v-for="item in stringTypeList"
                    :key="item.key"
                    :label="item.name"
                    :value="item.key"
                  />
                </el-option-group>
                <el-option-group label="Basic">
                  <el-option
                    v-for="item in typeList"
                    :key="item.key"
                    :label="item.name"
                    :value="item.key"
                  />
                </el-option-group>
                <el-option-group label="Unsigned">
                  <el-option
                    v-for="item in unsignedTypeList"
                    :key="item.key"
                    :label="item.name"
                    :value="item.key"
                  />
                </el-option-group>
              </el-select>
            </el-col>
            <template v-if="!element.hasLenght">
              <el-col :span="16">
                <el-input
                  class="struct-input"
                  v-model="element.value"
                  :disabled="element.type == ''"
                  :placeholder="element.type == '' ? 'No Data' : ''"
                />
              </el-col>
            </template>
            <template v-else>
              <el-col :span="3">
                <el-input
                  class="struct-input"
                  v-model="element.length"
                  type="number"
                  placeholder="length"
                  @keyup="updateStructureValues()"
                  @change="updateStructureValues()"
                />
              </el-col>
              <el-col :span="13">
                <el-input
                  class="struct-input"
                  v-model="element.value"
                  :disabled="element.type == ''"
                  :placeholder="element.type == '' ? 'No Data' : ''"
                />
              </el-col>
            </template>
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
import { defineComponent, ref } from "vue";
import Packet from "@/helpers/packet";
import draggable from "vuedraggable";
import { Delete } from "@element-plus/icons-vue";

interface Structure {
  id: number;
  name: string;
  type: string;
  value: string;
  hasLenght?: boolean;
  length?: number;
}

export default defineComponent({
  name: "packet-read",
  components: { draggable },
  setup() {
    let id_increment = 0;
    const textarea = ref("");
    const content = ref<HTMLDivElement | null>(null);
    const invalidHex = ref(false);

    const readStruct = (packet: Packet, type: string, length?: number) => {
      if (type == "bool") return String(packet.readBool());
      else if (type == "byte") return String(packet.readByte());
      else if (type == "short") return String(packet.readShort());
      else if (type == "int32") return String(packet.readInt());
      else if (type == "int64") return String(packet.readLong());
      else if (type == "ubyte") return String(packet.readUnsignedByte());
      else if (type == "ushort") return String(packet.readUnsignedShort());
      else if (type == "uint32") return String(packet.readUnsignedInt());
      else if (type == "uint64") return String(packet.readUnsignedLong());

      if (length) {
        if (type == "win1256") return packet.readString(length, "win1256");
        else if (type == "utf8") return packet.readString(length, "utf8");
      }
      return "";
    };

    const hexData = ref(
      "476c6f62616c5f4c6976655f312e302e3234000079617473756b69000000000000000000000000000000000000000000000000000000000000000000000000000000000000003134313139356c75666679403535000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000"
    );

    const structureList = ref<Structure[]>([
      { id: id_increment++, name: "hello", type: "", value: "" },
    ]);

    const onTypeChange = (s: Structure) => {
      if (s.length) s.length = undefined;
      updateStructureValues();
    };

    const updateStructureValues = () => {
      invalid.value = false;
      const packet = new Packet(Buffer.from(hexData.value, "hex"));
      return structureList.value.map((s) => {
        s.hasLenght = false;
        if (s.type && stringTypeList.find((t) => t.key == s.type))
          s.hasLenght = true;

        if (invalid.value) {
          s.value = "";
          return s;
        }

        try {
          const value = readStruct(
            packet,
            s.type,
            s.length ? Number(s.length) : undefined
          );
          s.value = s.type ? value : "";
        } catch (err) {
          invalid.value = true;
          s.value = "";
          console.error(err);
        }
        return s;
      });
    };

    const onHexDataChange = () => {
      hexData.value = hexData.value.replace(/ /g, "").replace(/\n/g, "");
      invalidHex.value = false;

      try {
        Buffer.from(hexData.value, "hex");
      } catch (error) {
        invalidHex.value = true;
        return;
      }

      updateStructureValues();
    };

    const invalid = ref(false);

    const typeList = [
      { name: "Boolean", key: "bool" },
      { name: "Byte", key: "byte" },
      { name: "Short", key: "short" },
      { name: "Int32", key: "int32" },
      { name: "Int64", key: "int64" },
    ];

    const unsignedTypeList = [
      { name: "Unsigned byte", key: "ubyte" },
      { name: "Unsigned short", key: "ushort" },
      { name: "Unsigned Int32", key: "uint32" },
      { name: "Unsigned Int64", key: "uint64" },
    ];

    const stringTypeList = [
      { name: "UTF-8", key: "utf8" },
      { name: "Windows-1256", key: "win1256" },
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
      stringTypeList,
      unsignedTypeList,
      hexData,
      Delete,
      deleteStruct,
      addNewStruct,
      content,
      invalidHex,
      updateStructureValues,
      onTypeChange,
      onHexDataChange,
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

.ghost {
  opacity: 0.2;
  background: var(--el-button-bg-color);
}
</style>
