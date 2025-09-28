package com.exemplo.agendasegura

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.telephony.SmsManager
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {
    
    private lateinit var etSenha: EditText
    private lateinit var btnEntrar: Button
    private lateinit var btnRecuperar: Button
    private lateinit var btnCadastrar: Button
    private lateinit var imgCofre: ImageView
    
    private val PERMISSION_REQUEST_CODE = 100
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Inicializar componentes
        initComponents()
        
        // Solicitar permissões
        requestPermissions()
        
        // Configurar eventos
        setupClickListeners()
        
        // Verificar se é primeiro acesso
        if (isFirstTime()) {
            startActivity(Intent(this, CadastroActivity::class.java))
            finish()
        }
    }
    
    private fun initComponents() {
        etSenha = findViewById(R.id.etSenha)
        btnEntrar = findViewById(R.id.btnEntrar)
        btnRecuperar = findViewById(R.id.btnRecuperarSenha)
        btnCadastrar = findViewById(R.id.btnCadastrar)
        imgCofre = findViewById(R.id.imgCofre)
    }
    
    private fun setupClickListeners() {
        btnEntrar.setOnClickListener {
            val senha = etSenha.text.toString()
            if (validarSenha(senha)) {
                startActivity(Intent(this, AgendaActivity::class.java))
                finish()
            } else {
                Toast.makeText(this, "Senha incorreta!", Toast.LENGTH_SHORT).show()
                etSenha.text.clear()
            }
        }
        
        btnRecuperar.setOnClickListener {
            recuperarSenhaViaSMS()
        }
        
        btnCadastrar.setOnClickListener {
            startActivity(Intent(this, CadastroActivity::class.java))
        }
    }
    
    private fun validarSenha(senha: String): Boolean {
        val senhaCorreta = getSenhaArmazenada()
        return senha == senhaCorreta
    }
    
    private fun getSenhaArmazenada(): String {
        val prefs = getSharedPreferences("AgendaSegura", MODE_PRIVATE)
        return prefs.getString("senha", "") ?: ""
    }
    
    private fun recuperarSenhaViaSMS() {
        val prefs = getSharedPreferences("AgendaSegura", MODE_PRIVATE)
        val telefone = prefs.getString("telefone", "")
        val senha = prefs.getString("senha", "")
        
        if (telefone.isNullOrEmpty()) {
            Toast.makeText(this, "Nenhum telefone cadastrado!", Toast.LENGTH_SHORT).show()
            return
        }
        
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) 
            == PackageManager.PERMISSION_GRANTED) {
            
            try {
                val smsManager = SmsManager.getDefault()
                val mensagem = "AgendaSegura - Sua senha é: $senha"
                smsManager.sendTextMessage(telefone, null, mensagem, null, null)
                Toast.makeText(this, "SMS enviado para $telefone", Toast.LENGTH_LONG).show()
            } catch (e: Exception) {
                Toast.makeText(this, "Erro ao enviar SMS: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        } else {
            Toast.makeText(this, "Permissão de SMS não concedida!", Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun isFirstTime(): Boolean {
        val prefs = getSharedPreferences("AgendaSegura", MODE_PRIVATE)
        return prefs.getString("senha", "").isNullOrEmpty()
    }
    
    private fun requestPermissions() {
        val permissions = arrayOf(
            Manifest.permission.SEND_SMS,
            Manifest.permission.READ_SMS,
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.CAMERA,
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.READ_PHONE_STATE
        )
        
        ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE)
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            // Verificar se as permissões foram concedidas
            val allGranted = grantResults.all { it == PackageManager.PERMISSION_GRANTED }
            if (!allGranted) {
                Toast.makeText(this, "Algumas permissões são necessárias para o funcionamento completo", 
                    Toast.LENGTH_LONG).show()
            }
        }
    }
}
