import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class AgendaActivity : AppCompatActivity() {

    private lateinit var tvBemVindo: TextView
    private lateinit var btnAdicionarContato: Button
    private lateinit var btnGaleria: Button
    private lateinit var btnSair: Button
    private lateinit var recyclerContatos: RecyclerView
    private lateinit var contatosAdapter: ContatosAdapter

    private var listaContatos = mutableListOf<Contato>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_agenda)

        initComponents()
        setupRecyclerView()
        setupClickListeners()
        carregarDadosUsuario()
        carregarContatos()
    }

    private fun initComponents() {
        tvBemVindo = findViewById(R.id.tvBemVindo)
        btnAdicionarContato = findViewById(R.id.btnAdicionarContato)
        btnGaleria = findViewById(R.id.btnGaleria)
        btnSair = findViewById(R.id.btnSair)
        recyclerContatos = findViewById(R.id.recyclerContatos)
    }

    private fun setupRecyclerView() {
        contatosAdapter = ContatosAdapter(listaContatos) { contato ->
            // Callback para editar contato
            editarContato(contato)
        }
        recyclerContatos.layoutManager = LinearLayoutManager(this)
        recyclerContatos.adapter = contatosAdapter
    }

    private fun setupClickListeners() {
        btnAdicionarContato.setOnClickListener {
            startActivity(Intent(this, AdicionarContatoActivity::class.java))
        }

        btnGaleria.setOnClickListener {
            startActivity(Intent(this, GaleriaActivity::class.java))
        }

        btnSair.setOnClickListener {
            mostrarDialogoSair()
        }
    }

    private fun carregarDadosUsuario() {
        val prefs = getSharedPreferences("AgendaSegura", MODE_PRIVATE)
        val nomeUsuario = prefs.getString("nome_usuario", "Usuário")
        tvBemVindo.text = "Bem-vindo(a), $nomeUsuario!"
    }

    private fun carregarContatos() {
        // Aqui você carregaria os contatos do banco de dados
        // Por simplicidade, vou usar um exemplo
        listaContatos.clear()
        // Exemplo de contatos
        listaContatos.add(Contato("João Silva", "11999999999", true))
        listaContatos.add(Contato("Maria Santos", "11888888888", false))
        contatosAdapter.notifyDataSetChanged()
    }

    private fun editarContato(contato: Contato) {
        val intent = Intent(this, AdicionarContatoActivity::class.java)
        intent.putExtra("contato_nome", contato.nome)
        intent.putExtra("contato_telefone", contato.telefone)
        intent.putExtra("contato_oculto", contato.numeroOculto)
        startActivity(intent)
    }

    private fun mostrarDialogoSair() {
        AlertDialog.Builder(this)
            .setTitle("Sair")
            .setMessage("Deseja realmente sair do AgendaSegura?")
            .setPositiveButton("Sim") { _, _ ->
                finish()
            }
            .setNegativeButton("Não", null)
            .show()
    }

    override fun onResume() {
        super.onResume()
        carregarContatos()
    }
}
