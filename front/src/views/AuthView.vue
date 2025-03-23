<template>
  <div class="auth-view">
    <div class="auth-container">
      <div class="auth-tabs">
        <button 
          class="tab-btn" 
          :class="{ 'active': activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          Login
        </button>
        <button 
          class="tab-btn" 
          :class="{ 'active': activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          Register
        </button>
      </div>
      
      <div class="auth-content">
        <LoginForm v-if="activeTab === 'login'" />
        <RegisterForm v-if="activeTab === 'register'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoginForm from '@/components/auth/LoginForm.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';

const activeTab = ref('login');
</script>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 1rem;
}

.auth-container {
  width: 100%;
  max-width: 520px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.auth-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background-color: #f9f9f9;
  color: #2196f3;
  border-bottom: 2px solid #2196f3;
}

.auth-content {
  padding: 1rem;
}
</style> 