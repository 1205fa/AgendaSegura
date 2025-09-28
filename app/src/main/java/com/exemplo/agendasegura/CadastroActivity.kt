import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity

class CadastroActivity : AppCompatActivity() {

    private lateinit var etNome: EditText
    private lateinit var etTelefone: EditText
    private lateinit var etSenha: EditText
    private lateinit var etConfirmarSenha: EditText
    private lateinit var btnSalvar: Button
    private lateinit var btnVoltar: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cadastro)

        initComponents()
        setupClickListeners()
    }

    private fun initComponents() {
        etNome = findViewById(R.id.etNome)
        etTelefone = findViewById(R.id.etTelefone)
        etSenha = findViewById(R.id.etSenha)
        etConfirmarSenha = findViewById(R.id.etConfirmarSenha)
        btnSalvar = findViewById(R.id.btnSalvar)
        btnVoltar = findViewById(R.id.btnVoltar)
    }

    private fun setupClickListeners() {
        btnSalvar.setOnClickListener {
            if (validarCampos()) {
                salvarDados()
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            }
        }

        btnVoltar.setOnClickListener {
            finish()
        }
    }

    private fun validarCampos(): Boolean {
        val nome = etNome.text.toString().trim()
        val telefone = etTelefone.text.toString().trim()
        val senha = etSenha.text.toString()
        val confirmarSenha = etConfirmarSenha.text.toString()

        when {
            nome.isEmpty() -> {
                showError("Nome é obrigatório!")
                return false
            }
            telefone.isEmpty() -> {
                showError("Telefone é obrigatório!")
                return false
            }
            telefone.length < 10 -> {
                showError("Telefone deve ter pelo menos 10 dígitos!")
                return false
            }
            senha.isEmpty() -> {
                showError("Senha é obrigatória!")
                return false
            }
            senha.length < 4 -> {
                showError("Senha deve ter pelo menos 4 caracteres!")
                return false
            }
            senha != confirmarSenha -> {
                showError("Senhas não coincidem!")
                return false
            }
        }
        return true
    }

    private fun salvarDados() {
        val prefs = getSharedPreferences("AgendaSegura", MODE_PRIVATE)
        val editor = prefs.edit()

        editor.putString("nome_usuario", etNome.text.toString().trim())
        editor.putString("telefone", etTelefone.text.toString().trim())
        editor.putString("senha", etSenha.text.toString())
        editor.putBoolean("primeiro_acesso", false)
        editor.apply()

        Toast.makeText(this, "Cadastro realizado com sucesso!", Toast.LENGTH_LONG).show()
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
}
