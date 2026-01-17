import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  /**
   * Sube una imagen al storage de Supabase
   * @param file - Archivo de imagen a subir
   * @param camperName - Nombre del campista para nombrar el archivo
   * @returns URL pública de la imagen subida
   */
  async uploadCamperImage(file: File, camperName: string): Promise<string> {
    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${camperName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
      const filePath = `manantial/${fileName}`;

      console.log('Intentando subir archivo:', { fileName, filePath, bucketName: 'campPictures' });

      // Subir archivo al bucket "campPictures"
      const { data, error } = await this.supabase.storage
        .from('campPictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error detallado al subir:', error);
        throw new Error(`Error al subir imagen: ${error.message}`);
      }

      console.log('Archivo subido exitosamente:', data);

      // Obtener URL pública de la imagen
      const { data: { publicUrl } } = this.supabase.storage
        .from('campPictures')
        .getPublicUrl(filePath);

      console.log('URL pública generada:', publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error('Error completo al subir imagen:', error);
      throw new Error(error.message || 'Error desconocido al subir la imagen');
    }
  }

  /**
   * Guarda un registro de campista en la base de datos (Manantial)
   * @param registrationData - Datos del formulario de registro
   * @returns Datos del registro creado
   */
  async createRegistration(registrationData: any) {
    try {
      const { data, error } = await this.supabase
        .from('manantial_registrations')
        .insert([registrationData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating registration:', error);
      throw error;
    }
  }

  /**
   * Sube una imagen al storage de Supabase para Verbo
   * @param file - Archivo de imagen a subir
   * @param camperName - Nombre del campista para nombrar el archivo
   * @returns URL pública de la imagen subida
   */
  async uploadVerboCamperImage(file: File, camperName: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${camperName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
      const filePath = `verbo/${fileName}`;

      console.log('Intentando subir archivo Verbo:', { fileName, filePath, bucketName: 'campPictures' });

      const { data, error } = await this.supabase.storage
        .from('campPictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error detallado al subir:', error);
        throw new Error(`Error al subir imagen: ${error.message}`);
      }

      console.log('Archivo Verbo subido exitosamente:', data);

      const { data: { publicUrl } } = this.supabase.storage
        .from('campPictures')
        .getPublicUrl(filePath);

      console.log('URL pública generada:', publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error('Error completo al subir imagen Verbo:', error);
      throw new Error(error.message || 'Error desconocido al subir la imagen');
    }
  }

  /**
   * Guarda un registro de campista en la base de datos (Verbo)
   * @param registrationData - Datos del formulario de registro
   * @returns Datos del registro creado
   */
  async createVerboRegistration(registrationData: any) {
    try {
      const { data, error } = await this.supabase
        .from('verbo_registrations')
        .insert([registrationData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating Verbo registration:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los registros de campistas de Verbo
   */
  async getVerboRegistrations() {
    try {
      const { data, error } = await this.supabase
        .from('verbo_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching Verbo registrations:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los registros de campistas
   */
  async getRegistrations() {
    try {
      const { data, error } = await this.supabase
        .from('manantial_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    }
  }

  /**
   * Elimina una imagen del storage
   * @param imageUrl - URL de la imagen a eliminar
   */
  async deleteImage(imageUrl: string) {
    try {
      // Extraer el path del archivo de la URL
      const urlParts = imageUrl.split('/campPictures/');
      if (urlParts.length < 2) return;
      
      const filePath = decodeURIComponent(urlParts[1]);

      const { error } = await this.supabase.storage
        .from('campPictures')
        .remove([filePath]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // ==================== CROSSWORLDS CONNECTIONS ====================

  /**
   * Sube una imagen al storage de Supabase para Crossworlds Connections
   * @param file - Archivo de imagen a subir
   * @param camperName - Nombre del campista para nombrar el archivo
   * @returns URL pública de la imagen subida
   */
  async uploadCrossworldsConnectionsImage(file: File, camperName: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${camperName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
      const filePath = `crossworlds_connections/${fileName}`;

      console.log('Intentando subir archivo Crossworlds Connections:', { fileName, filePath, bucketName: 'campPictures' });

      const { data, error } = await this.supabase.storage
        .from('campPictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error detallado al subir:', error);
        throw new Error(`Error al subir imagen: ${error.message}`);
      }

      console.log('Archivo Crossworlds Connections subido exitosamente:', data);

      const { data: { publicUrl } } = this.supabase.storage
        .from('campPictures')
        .getPublicUrl(filePath);

      console.log('URL pública generada:', publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error('Error completo al subir imagen Crossworlds Connections:', error);
      throw new Error(error.message || 'Error desconocido al subir la imagen');
    }
  }

  /**
   * Guarda un registro de campista en la base de datos (Crossworlds Connections)
   * @param registrationData - Datos del formulario de registro
   * @returns Datos del registro creado
   */
  async createCrossworldsConnectionsRegistration(registrationData: any) {
    try {
      const { data, error } = await this.supabase
        .from('crossworlds_connections')
        .insert([registrationData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating Crossworlds Connections registration:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los registros de campistas de Crossworlds Connections
   */
  async getCrossworldsConnectionsRegistrations() {
    try {
      const { data, error } = await this.supabase
        .from('crossworlds_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching Crossworlds Connections registrations:', error);
      throw error;
    }
  }

  /**
   * Actualiza un registro de Crossworlds Connections
   * @param id - ID del registro a actualizar
   * @param registrationData - Datos actualizados
   */
  async updateCrossworldsConnectionsRegistration(id: number, registrationData: any) {
    try {
      const { data, error } = await this.supabase
        .from('crossworlds_connections')
        .update(registrationData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating Crossworlds Connections registration:', error);
      throw error;
    }
  }

  /**
   * Elimina un registro de Crossworlds Connections
   * @param id - ID del registro a eliminar
   */
  async deleteCrossworldsConnectionsRegistration(id: number) {
    try {
      const { error } = await this.supabase
        .from('crossworlds_connections')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting Crossworlds Connections registration:', error);
      throw error;
    }
  }
}
