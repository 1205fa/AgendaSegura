import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class ContatosAdapter(
    private val contatos: List<Contato>,
    private val onItemClick: (Contato) -> Unit
) : RecyclerView.Adapter<ContatosAdapter.ContatoViewHolder>() {

    class ContatoViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvNome: TextView = view.findViewById(R.id.tvNomeContato)
        val tvTelefone: TextView = view.findViewById(R.id.tvTelefoneContato)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ContatoViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_contato, parent, false)
        return ContatoViewHolder(view)
    }

    override fun onBindViewHolder(holder: ContatoViewHolder, position: Int) {
        val contato = contatos[position]

        holder.tvNome.text = contato.nome
        holder.tvTelefone.text = if (contato.numeroOculto) {
            "***-****-****"
        } else {
            contato.telefone
        }

        holder.itemView.setOnClickListener {
            onItemClick(contato)
        }
    }

    override fun getItemCount() = contatos.size
}
Salve: Ctrl+O, Enter, Ctrl+X

PASSO 14: Layout da AgendaActivity (activity_agenda.xml)
nano app/src/main/res/layout/activity_agenda.xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="@color/neon_black"
    android:padding="20dp">

    <!-- Header -->
    <TextView
        android:id="@+id/tvBemVindo"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Bem-vindo(a)!"
        android:textColor="@color/neon_cyan"
        android:textSize="22sp"
        android:textStyle="bold"
        android:gravity="center"
        android:layout_marginBottom="20dp"/>

    <!-- Título -->
    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="AGENDA SEGURA"
        android:textColor="@color/neon_green"
        android:textSize="18sp"
        android:textStyle="bold"
        android:gravity="center"
        android:layout_marginBottom="30dp"/>

    <!-- Botões Principais -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginBottom="20dp">

        <Button
            android:id="@+id/btnAdicionarContato"
            android:layout_width="0dp"
            android:layout_height="55dp"
            android:layout_weight="1"
            android:text="ADICIONAR"
            android:textColor="@color/neon_black"
            android:textStyle="bold"
            android:background="@drawable/button_neon_green"
            android:layout_marginEnd="10dp"/>

        <Button
            android:id="@+id/btnGaleria"
            android:layout_width="0dp"
            android:layout_height="55dp"
            android:layout_weight="1"
            android:text="GALERIA"
            android:textColor="@color/neon_black"
            android:textStyle="bold"
            android:background="@drawable/button_neon_cyan"/>

    </LinearLayout>

    <!-- Lista de Contatos -->
    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="SEUS CONTATOS:"
        android:textColor="@color/neon_pink"
        android:textSize="16sp"
        android:textStyle="bold"
        android:layout_marginBottom="10dp"/>

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/recyclerContatos"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:layout_marginBottom="20dp"/>

    <!-- Botão Sair -->
    <Button
        android:id="@+id/btnSair"
        android:layout_width="match_parent"
        android:layout_height="55dp"
        android:text="SAIR"
        android:textColor="@color/neon_black"
        android:textStyle="bold"
        android:background="@drawable/button_neon_pink"/>

</LinearLayout>
